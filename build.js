var lambda = require('./lambda.js');
var apiGateway = require('./api-gateway.js');
var fs = require('fs');
var packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));


String.prototype.replaceAll = function(find, replace) {
    var str = this;
    return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};

module.exports = {
    run: function(conf, stage, version, skipUpload) {
        var me = this;

        return me.buildLambda(conf, stage, version, skipUpload)
            .then(function() {
                if (skipUpload) {
                    return 0;
                } else {
                    return me.deployStaticAssets(conf, version);
                }
            })
            .then(function() {
                return me.buildApiGateway(conf, stage, 'latest', skipUpload)
            })
            .then(function() {
            	return me.deployStage(conf, stage, 'latest');
            })
    },

    buildLambda: function(conf, stage, version, skipUpload) {
        return lambda.updateLambda(conf.name, version, conf.bucket, skipUpload)
            .then(function(result) {
                if (conf.arn) { // the function already exists
                    return lambda.updateFunction(conf.arn, conf.name, version, conf.bucket, conf['lambda-role']);
                } else {
                    return lambda.createFunction(conf.name, version, conf.bucket, conf['lambda-role'])
                        .then(function(result) {

                            conf.arn = result.FunctionArn;
                            fs.writeFileSync('package.json', JSON.stringify(packageJson, null, '\t', 'utf8'));
                            console.log('function created', result);
                            return "yes!";
                        })
                        .catch(function(err) {
                            console.log('function create errored out', result);
                        });
                }
            })
            .then(function(result) {
                return lambda.clearPermissions(conf.arn)
            })


    },
    deployStaticAssets: function(conf, version) {
        return lambda.uploadFolder(conf.bucket, 'swaggy-lambda/' + conf.name,
            './swagger-ui', 'https://' + conf.restApiId + '.execute-api.us-east-1.amazonaws.com', version);
    },

    deployStage: function(conf, stage, version) {

        var versionArn = conf.arn;

        if (version != 'latest') {
            versionArn += ':' + version.replaceAll('.', '-');
        }

        var remotepath = 'swaggy-lambda/' + conf.name;
        var apiUrl = 'https://' + conf.restApiId + '.execute-api.us-east-1.amazonaws.com';


        return lambda.deploySwaggerFile(conf.bucket, remotepath, apiUrl, version, stage)
            .then(function() {
                return lambda.deployIndexHtml(conf.bucket, remotepath, apiUrl, version, stage)
            })         
            .then(function(result) {
            	 if (conf.stages[stage] == null) {
                    conf.stages[stage] = {
                        "variables": {}
                    }
                }

                return apiGateway.deployStage(conf.restApiId, stage, version, conf.stages[stage].variables).then(function(result) {
                    console.log('result', result);
                    return result;
                })
            })
            .then(function() {
                // Make sure stage is configured in conf
               

                if (conf.stages[stage].apiKey == null || conf.stages[stage].apiKey == '') {
                    console.log('Create API Key');

                    var createApiKeyParams = {
                        description: 'API key for ' + conf.name + ' - ' + stage,
                        enabled: true,
                        name: conf.name + ' - ' + stage,
                        stageKeys: [{
                            restApiId: conf.restApiId,
                            stageName: stage
                        }]
                    };
                    return apiGateway.createApiKey(createApiKeyParams).then(function(result) {

                        conf.stages[stage].apiKey = result.id;
                        console.log('New API Key:' + conf.stages[stage].apiKey);

                        return result;
                    });
                } else {
                    console.log('Existing API Key:' + conf.stages[stage].apiKey);
                    return "";
                }  
            })
    },

    buildApiGateway: function(conf, stage, version, skipUpload) {
        var versionArn = conf.arn;

        if (version != 'latest') {
            versionArn += ':' + version.replaceAll('.', '-');
        }

        var remotepath = 'swaggy-lambda/' + conf.name;
        var apiUrl = 'https://' + conf.restApiId + '.execute-api.us-east-1.amazonaws.com';


        return lambda.deploySwaggerFile(conf.bucket, remotepath, apiUrl, version, stage)
            .then(function() {
                return lambda.deployIndexHtml(conf.bucket, remotepath, apiUrl, version, stage)
            })
            .then(function(result) {
                // remove all the resources
                console.log('Remove all existing resources');
                return apiGateway.deleteResources(conf.restApiId);
            })
            .then(function() {
                return apiGateway.getRoot(conf.restApiId)
            })
            .then(function(rootResource) {
                // Set up the /docs and /swagger resources

                return apiGateway.createResource(conf.restApiId, "swagger", {
                    "isVariable": false,
                    "pathPart": "swagger",
                    "methods": {
                        "get": {
                            "x-swagger-proxy": "https://s3.amazonaws.com/" + conf.bucket + "/swaggy-lambda/" + conf.name + "/${stageVariables.version}/swagger.${stageVariables.stage}.json",
                            parameters: []
                        }
                    }
                }, rootResource, versionArn, '033374767009').then(function(resource) {
                    return rootResource;
                })

            })
            .then(function(rootResource) {
                // Set up the /docs and /swagger resources

                return apiGateway.createResource(conf.restApiId, "docs", {
                    "isVariable": false,
                    "pathPart": "swagger",
                    "methods": {
                        "get": {
                            "x-swagger-proxy": "https://s3.amazonaws.com/" + conf.bucket + "/swaggy-lambda/" + conf.name + "/${stageVariables.version}/index.${stageVariables.stage}.html",
                            parameters: []
                        }
                    }
                }, rootResource, versionArn, '033374767009', 'text/html').then(function(resource) {
                    return rootResource;
                })

            })
            .then(function(result) {
                return apiGateway.createResources(conf.restApiId, versionArn, '033374767009');
            })
            .then(function(result) {

                console.log('Calling apiGateway.deploy', conf.restApiId, stage, version);
                return apiGateway.createDeployment(conf.restApiId, stage, version);
            })
            .then(function(result) {
                return apiGateway.setPermissions(conf.restApiId, versionArn, '033374767009');
            })
            .then(function(result) {
                return lambda.showPermissions(conf.arn, version);
            })
            .catch(function(err) {
                console.log('err:', err);
            });

    }

}
