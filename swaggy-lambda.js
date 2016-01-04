#! /usr/bin/env node

var program = require('commander');
var fs = require('fs');
var lambda = require('./lambda.js');
var build = require('./build.js');
var apiGateway = require('./api-gateway.js');
var serialize = require('node-serialize');
var beautify = require('js-beautify').js_beautify;
var Handlebars = require('handlebars');
var prompt = require('prompt');
var Q = require('q');
var util = require('./util');
var wrench = require('wrench');

var packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));



var sampleSwagger = require('./sampleswagger.json');

program.version('0.1.0')

program
    .command('init')
    .action(function() {

        var swaggerFile = './swagger.json';

        /*
        	- If "swagger-lamba" node is null, create it.
        	- If "swagger-lamba.gatewayName" is null, prompt the user for a name, default to the name in package.json
        	- If "swagger-lambda.restApi" is null, create an API for the gateway name, store the restApi value in this key

        */
        if (packageJson['swagger-lamba'] == null) {
            packageJson['swagger-lamba'] = {};
        }

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
                        default: packageJson.name
                    }
                }
            };

            prompt.start();

            //
            // Get two properties from the user: email, password
            //
            promise = Q.nfcall(prompt.get, schema).then(function(result) {
                console.log('Command-line input received:');
                console.log('  name: ' + result.apiName);
                console.log('  apiDescription ' + result.apiDescription);
                packageJson['swagger-lamba'].name = result.apiName;
                packageJson['swagger-lamba'].description = result.apiDescription;
                packageJson['swagger-lamba'].bucket = result.bucket;



                return apiGateway.initializeGateway(result.apiName, result.apiDescription)
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

            console.log('resources', JSON.stringify(resources, null, '\t'));

            for (var resource in resources) {

                try {
                    stats = fs.statSync('api/' + resource + '.js');
                    console.log("File exists.");
                } catch (e) {
                    console.log("File does not exist.");



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

    });

program
    .command('create-version <version>')
    .action(function(version) {
        var conf = packageJson['swagger-lamba'];
        console.log('create-version', version);

        lambda.publishVersion(conf.arn, version).then(function(result) {
                console.log('create alias COMPLETE', result);
                return result;
            })
            .then(function(result) {
                console.log('deployStatic Assets buildApiGateway');
                return build.deployStaticAssets(conf, version, false);
            })
            .then(function(result) {
                console.log('calling buildApiGateway');
                return build.buildApiGateway(conf, 'createversion', version, false);
            })
            .then(function(result) {
                //delete the createversion stage
            })
            .catch(function(err) {
                console.log('publishVersion Error', err);
            });

    });

program
    .command('deploy-version <version> <stage>')
    .action(function(version, stage) {
        var conf = packageJson['swagger-lamba'];
        console.log('deploy-version', version, stage);

        build.deployStage(conf, stage, version).then(function(result) {
                console.log('result', result);
                fs.writeFileSync('package.json', JSON.stringify(packageJson, null, '\t', 'utf8'));
            })
            /*
            build.buildApiGateway(conf, stage, version, false).then(function(result) {
                console.log('Deploy to ' + version + ' to ' + stage + ' COMPLETE', result);
            }).*/
            .catch(function(err) {
                console.log('ERROR: ', err);
            });

    });

program
    .command('build')
    .action(function() {
        var conf = packageJson['swagger-lamba'];
        var skipUpload = false;

        build.run(conf, 'build', 'latest', skipUpload)
            .done(function(result) {
                fs.writeFileSync('package.json', JSON.stringify(packageJson, null, '\t', 'utf8'));
                console.log('all done!');
            });;

    });
program
    .command('permissions <version>')
    .action(function(version) {
        var conf = packageJson['swagger-lamba'];
        var versionArn = conf.arn;

        if (version != 'latest') {
            versionArn += ':' + version.replaceAll('.', '-');
        }

        lambda.showPermissions(conf.arn, version);
        //apiGateway.setPermissions(conf.restApiId, versionArn, '033374767009');

    });

program
    .command('list-keys')
    .action(function() {
        var conf = packageJson['swagger-lamba'];

        apiGateway.listKeys();
        //apiGateway.setPermissions(conf.restApiId, versionArn, '033374767009');

    });

program.parse(process.argv);
