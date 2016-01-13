#! /usr/bin/env node

var program = require('commander');
var fs = require('fs');
var serialize = require('node-serialize');
var beautify = require('js-beautify').js_beautify;
var Handlebars = require('handlebars');
var prompt = require('prompt');
var Q = require('q');
var util = require('./util');
var wrench = require('wrench');
var child_process = require('child_process');

var packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));



var sampleSwagger = require('./sampleswagger.json');

program.version('0.1.0')


program
    .command('bootstrap')
    .action(function() {

        // If the user wants the sample project, first copy the swagger.sample.json to swagger.json
        // and the Model1->Model5 files in the API.
        var sampleSwagger = fs.readFileSync(__dirname + '/sampleswagger.json', 'utf8');
        fs.writeFileSync('swagger.json', sampleSwagger, 'utf8');

        wrench.copyDirSyncRecursive(__dirname + '/api', 'api', {
            forceDelete: true
        });

        wrench.copyDirSyncRecursive(__dirname + '/sample-test', 'test', {
            forceDelete: true
        });


        child_process.execFileSync('npm', ['install', 'body-parser', '--save'], {
            timeout: 10000
        });
        child_process.execFileSync('npm', ['install', 'chai', '--save'], {
            timeout: 10000
        });
        child_process.execFileSync('npm', ['install', 'express', '--save'], {
            timeout: 10000
        });

        child_process.execFileSync('npm', ['install', 'handlebars', '--save'], {
            timeout: 10000
        });
        child_process.execFileSync('npm', ['install', 'z-schema', '--save'], {
            timeout: 10000
        });
        child_process.execFileSync('npm', ['install', 'validator', '--save'], {
            timeout: 10000
        });

        //    "chai": "^3.4.1",
        //    "express": "^4.13.3",
        //    "validator": "^4.4.0",
        //    "z-schema": "^3.16.1"'])
        packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

        var build = require('./build.js');

        build.init('resource-template');

    });

program
    .command('mysql-bootstrap')
    .action(function() {

        // If the user wants the sample project, first copy the swagger.sample.json to swagger.json
        // and the Model1->Model5 files in the API.
        var sampleSwagger = fs.readFileSync(__dirname + '/swagger.mysql.json', 'utf8');
        fs.writeFileSync('swagger.json', sampleSwagger, 'utf8');


        var contextExtensions = fs.readFileSync(__dirname + '/contextExtensions.mysql.js', 'utf8');
        fs.writeFileSync('contextExtensions.js', contextExtensions, 'utf8');


        wrench.copyDirSyncRecursive(__dirname + '/mysql-api', 'api', {
            forceDelete: true
        });


        wrench.copyDirSyncRecursive(__dirname + '/mysql-test', 'test', {
            forceDelete: true
        });


        child_process.execFileSync('npm', ['install', 'body-parser', '--save'], {
            timeout: 10000
        });
        child_process.execFileSync('npm', ['install', 'chai', '--save'], {
            timeout: 10000
        });
        child_process.execFileSync('npm', ['install', 'express', '--save'], {
            timeout: 10000
        });

        child_process.execFileSync('npm', ['install', 'mysql', '--save'], {
            timeout: 10000
        });

        child_process.execFileSync('npm', ['install', 'handlebars', '--save'], {
            timeout: 10000
        });
        child_process.execFileSync('npm', ['install', 'z-schema', '--save'], {
            timeout: 10000
        });
        child_process.execFileSync('npm', ['install', 'validator', '--save'], {
            timeout: 10000
        });

        var build = require('./build.js');

        //    "chai": "^3.4.1",
        //    "express": "^4.13.3",
        //    "validator": "^4.4.0",
        //    "z-schema": "^3.16.1"'])

        var schema = {
            properties: {
                localDbConnection: {
                    message: 'Local DB Connection String [mysql://user:pass@host/db]:',
                    required: true,
                    default: process.env.LOCAL_BOOSTRAP_DB
                },
                buildDbConnection: {
                    message: 'Build Stage DB Connection [mysql://user:pass@host/db]:',
                    required: true,
                    default: process.env.BUILD_BOOSTRAP_DB
                }
            }
        };

        prompt.start();

        //
        // Get two properties from the user: email, password
        //
        promise = Q.nfcall(prompt.get, schema).then(function(result) {

            packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            var conf = packageJson['swagger-lamba'];



            if (conf == null) {
                packageJson['swagger-lamba'] = {};
                conf = packageJson['swagger-lamba'];
            }

            console.log('Reopened package.json', conf);

            if (conf.stages == null) {
                conf.stages = {};
            }

            if (conf.stages.local == null) {
                conf.stages.local = {
                    apiKey: '1234567890',
                    variables: {}
                }
            }

            if (conf.stages.local.variables.mysql == null) {
                conf.stages.local.variables.mysql = {}
            }


            conf.stages.local.variables.mysql.connectionLimit = 10;
            conf.stages.local.variables.mysql.connection = result.localDbConnection;

            if (conf.stages.build == null) {
                conf.stages.build = {
                    variables: {}
                }
            }

            if (conf.stages.build.variables.mysql == null) {
                conf.stages.build.variables.mysql = {}
            }

            conf.stages.build.variables.mysql.connectionLimit = 10;
            conf.stages.build.variables.mysql.connection = result.buildDbConnection;

            console.log('Writing package.json');

            fs.writeFileSync('package.json', JSON.stringify(packageJson, null, '\t'), 'utf8');



            build.init('mysql-template');
        });

    });

program
    .command('init-mysql')
    .action(function() {

        var build = require('./build.js');

        build.init('mysql-template');

    });

program
    .command('init')
    .action(function() {
        var build = require('./build.js');
        build.init('resource-template');

    });

program
    .command('create-version <version>')
    .action(function(version) {
        var conf = packageJson['swagger-lamba'];
        console.log('create-version', version);
        var lambda = require('./lambda.js');
        var build = require('./build.js');

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
                return build.buildApiGateway(conf, 'createversion', version, false, conf.customerId);
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
        var build = require('./build.js');

        build.deployStage(conf, stage, version).then(function(result) {
                console.log('Stage Url:', result);
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

        var build = require('./build.js');

        build.run(conf, 'build', 'latest', skipUpload, conf.customerId)
            .done(function(result) {
                fs.writeFileSync('package.json', JSON.stringify(packageJson, null, '\t', 'utf8'));
                console.log('test url: ' + result)
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

        var lambda = require('./lambda.js');

        lambda.showPermissions(conf.arn, version);
        //apiGateway.setPermissions(conf.restApiId, versionArn, '033374767009');

    });

program
    .command('list-keys')
    .action(function() {
        var conf = packageJson['swagger-lamba'];
        var apiGateway = require('./api-gateway.js');

        apiGateway.listKeys();
        //apiGateway.setPermissions(conf.restApiId, versionArn, '033374767009');

    });

program
    .command('create-role <name>')
    .action(function(name) {
        var lambda = require('./lambda.js');

        lambda.createRole(name);
        //apiGateway.setPermissions(conf.restApiId, versionArn, '033374767009');

    });



program.parse(process.argv);
