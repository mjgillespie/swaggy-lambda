var lambda = require('./lambda.js');
var apiGateway = require('./api-gateway.js');
var fs = require('fs');
var Q = require('q');
var packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
var prompt = require('prompt');
var wrench = require('wrench');
var util = require('./util');

var sampleSwagger = require('./sampleswagger.json');


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
                            console.log('buildLambda ERROR: ', err);
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
                    return result;
                })
            })
            .then(function() {
                // Make sure stage is configured in conf


                if (conf.stages[stage].apiKey == null || conf.stages[stage].apiKey == '') {
                    
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

                        return apiUrl + '/' + stage + '/docs?apiKey=' + conf.stages[stage].apiKey;
                    });
                } else {
                   
                    return apiUrl + '/' + stage + '/docs?apiKey=' + conf.stages[stage].apiKey;;
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

    },
    init: function() {
        var swaggerFile = './swagger.json';

        packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        /*
            - If "swagger-lamba" node is null, create it.
            - If "swagger-lamba.gatewayName" is null, prompt the user for a name, default to the name in package.json
            - If "swagger-lambda.restApi" is null, create an API for the gateway name, store the restApi value in this key

        */
        if (packageJson['swagger-lamba'] == null) {
            packageJson['swagger-lamba'] = {};
        }

        if (packageJson['swagger-lamba'].stages == null) {
            packageJson['swagger-lamba'].stages = {};
        }
        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, '\t', 'utf8'));

        var promise = Q();

        if (packageJson['swagger-lamba'].name == null || packageJson['swagger-lamba'].restApiId == null) {
            var schema = {
                properties: {
                    apiName: {
                        pattern: /^[a-zA-Z\s\-]+$/,
                        message: 'Name must be only letters, spaces, or dashes',
                        required: true,
                        default: packageJson.name
                    },
                    apiDescription: {
                        message: 'Describe the purpose of the API.',
                        required: true,
                        default: packageJson.name
                    },
                    bucket: {
                        message: 'S3 Bucket Name',
                        required: true,
                        default: process.env.BUCKET_NAME
                    },
                    "lambda-role": {
                        message: 'AWS lambda role',
                        required: false
                    }
                }
            };

            prompt.start();

            //
            // Get two properties from the user: email, password
            //
            promise = Q.nfcall(prompt.get, schema).then(function(result) {
                packageJson['swagger-lamba'].name = result.apiName;
                packageJson['swagger-lamba'].description = result.apiDescription;
                packageJson['swagger-lamba'].bucket = result.bucket;


                var rolePromise;
                if (result['lambda-role'] == null || result['lambda-role'] == '') {
                    rolePromise = lambda.createRole('swaggy-lambda-basic')
                } else {
                    rolePromise = Q(result['lambda-role'])
                }

                return rolePromise.then(function(roleArn) {

                    packageJson['swagger-lamba']['lambda-role'] = roleArn;



                    return apiGateway.initializeGateway(result.apiName, result.apiDescription)

                });


            }).then(function(result) {
                console.log('API Gateway Created');
                packageJson['swagger-lamba'].restApiId = result.id;
                fs.writeFileSync('package.json', JSON.stringify(packageJson, null, '\t', 'utf8'));
            }).catch(function(err) {
                console.log('API Gateway Created error', err);
            });


        }

        promise.done(function(lastItem) {
            try {
                var swaggerAccess = fs.accessSync(swaggerFile);
                //           console.log('Using existing swagger file');
            } catch (err) {
                // file dows not exist, put a placeholder file there
                //        console.log('Initializing swagger file');

                fs.writeFileSync(swaggerFile, JSON.stringify(sampleSwagger, null, '\t') + '\n', 'utf8');
            }

            try {
                var swaggerAccess = fs.accessSync('api/');

                //   console.log('Using api folder');
            } catch (err) {
                // file dows not exist, put a placeholder file there
                //  console.log('Initializing api folder');
                fs.mkdirSync('api');
            }

            // copy the swagger-ui folder
            wrench.copyDirSyncRecursive(__dirname + '/swagger-ui', 'swagger-ui', {
                forceDelete: true
            });

            var utilJs = fs.readFileSync(__dirname + '/util.js', 'utf8');

            fs.writeFileSync('util.js', utilJs, 'utf8');

            var lambdaInvokeJs = fs.readFileSync(__dirname + '/lambda-invoke.js', 'utf8');

            fs.writeFileSync('lambda-invoke.js', lambdaInvokeJs, 'utf8');

            var expressApp = fs.readFileSync(__dirname + '/app.template.js', 'utf8');

            fs.writeFileSync('app.js', expressApp, 'utf8');

            var resources = util.parseSwaggerFile('swagger.json').resources;

           
            for (var resource in resources) {

                try {
                    stats = fs.statSync('api/' + resource + '.js');
                   } catch (e) {
                    


                    /* try {


                         var swaggerAccess = fs.accessSync('api/' + resource + '.js');
                         console.log('Using existing resource file');
                     } catch (err) {*/
                    //            console.log('Create a new resource file from a template');



                    var resourceJs = fs.readFileSync(__dirname + '/resource-template.js', 'utf8');

                    var template = Handlebars.compile(resourceJs);

                    var data = {
                        "resourceName": resource,
                        "methods": resources[resource].methods
                    };
                    var result = template(data);
                    fs.writeFileSync('api/' + resource + '.js', result, 'utf8');
                    //}
                }
            }
        });
    }

}
