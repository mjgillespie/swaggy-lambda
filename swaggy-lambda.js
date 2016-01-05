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
var child_process = require('child_process');

var packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));



var sampleSwagger = require('./sampleswagger.json');

program.version('0.1.0')


program
    .command('init-sample')
    .action(function() {

        // If the user wants the sample project, first copy the swagger.sample.json to swagger.json
        // and the Model1->Model5 files in the API.
        var sampleSwagger = fs.readFileSync(__dirname + '/sampleswagger.json', 'utf8');
        fs.writeFileSync('swagger.js', sampleSwagger, 'utf8');

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


        build.init();

    });

program
    .command('init')
    .action(function() {

        build.init();

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

program
    .command('create-role <name>')
    .action(function(name) {

        lambda.createRole(name);
        //apiGateway.setPermissions(conf.restApiId, versionArn, '033374767009');

    });



program.parse(process.argv);
