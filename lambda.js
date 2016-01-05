var AWS = require('aws-sdk');
var Q = require('q');
var awsQ = require('aws-q');
var Zip = require('node-zip');
var fs = require('fs');
var util = require('./util.js');
var Handlebars = require('handlebars');
var uuid = require('node-uuid');

awsQ(AWS);

AWS.config.region = 'us-east-1';

AWS.config.apiVersions = {
    s3: '2006-03-01',
    apigateway: '2015-07-09',
    iam: '2010-05-08'

    // other service API versions
};

var lambda = new AWS.Lambda();
var iam = new AWS.IAM();
var s3 = new AWS.S3();

Array.prototype.extend = function(other_array) {
    /* you should include a test to check whether other_array really is an array */
    other_array.forEach(function(v) {
        this.push(v)
    }, this);
}

String.prototype.replaceAll = function(find, replace) {
    var str = this;
    return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};

module.exports = {
    updateLambda: function(restApiName, label, bucket, skipUpload) {

        console.log('updateLambda', restApiName, label, bucket, skipUpload);
        var functionName = restApiName + '-invoke';

        var zip3 = new Zip();

        var lambdaInvokeJs = fs.readFileSync(__dirname + '/lambda-invoke.js', 'utf8');

        zip3.file('main.js', lambdaInvokeJs);
        var utilJs = fs.readFileSync(__dirname + '/util.js', 'utf8');

        zip3.file('util.js', utilJs);

        var swaggerJs = fs.readFileSync('./swagger.json', 'utf8');

        zip3.file('swagger.json', swaggerJs);




        var apiFolder = zip3.folder('api');

        var files = fs.readdirSync('api');

        for (var i = 0; i < files.length; i++) {
            var file = files[i];

            var lambdaInvokeJs = fs.readFileSync('api/' + file);

            apiFolder.file(file, lambdaInvokeJs);

        }



        this.addFolderToZip('node_modules', 'node_modules', zip3, {
            "aws-sdk": true,
            "express": true,
            "body-parser": true,
            ".bin": true
        });


        var data = zip3.generate({
            base64: false,
            compression: 'DEFLATE'
        });
        fs.writeFileSync('./' + functionName + '.zip', data, 'binary');

        var data = fs.readFileSync('./' + functionName + '.zip');

        console.log('bucket', bucket, skipUpload);

        if (skipUpload) {
            return Q();
        } else {
            return s3.putObject({
                Bucket: bucket,
                Key: 'swaggy-lambda/' + restApiName + '/' + label + '/' + functionName + '.zip',
                Body: data
            }).then(function(result) {
                console.log('S3 ZIP Upload', result);
                return result;
            }).catch(function(err) {
                console.log('S3 ZIP Upload ERROR. bucket:' + bucket, err);
                return err;
            });

        }

    },

    clearPermissions: function(lambdaArn) {
        var me = this;

        return lambda.getPolicy({
            FunctionName: lambdaArn
        }).then(function(getPolicyResult) {
            var policy = JSON.parse(getPolicyResult.Policy);


            var promise = Q(0);

            if (policy.Statement != null) {
                promise = me.removePermission(lambdaArn, 0, policy.Statement, me);
            }
            return promise;
        }).catch(function(err) {
            console.log("should be ok, no existing permissions")
        });

    },
    removePermission: function(arn, policyNbr, policies, me) {
        var stmt = policies[policyNbr];
        return lambda.removePermission({
            FunctionName: arn,
            StatementId: stmt.Sid
        }).then(function(result) {

            policyNbr++;
            if (policyNbr < policies.length) {
                return me.removePermission(arn, policyNbr, policies, me);
            }
            return Q('done');
        }).catch(function(err) {
            console.log('permission removed...ERROR', err);
        });
    },

    addFolderToZip: function(folderName, folderPath, zipFolder, excludes) {
        var newFolder = zipFolder.folder(folderName);
        var files = fs.readdirSync(folderPath);



        for (var i = 0; i < files.length; i++) {
            var file = files[i];



            if (!file.startsWith('.') && excludes[file] == null) {
                var stat = fs.statSync(folderPath + '/' + file);



                if (stat.isDirectory()) {
                    this.addFolderToZip(file, folderPath + '/' + file, newFolder, {});
                } else {
                    var data = fs.readFileSync(folderPath + '/' + file, 'base64');
                    // c


                    newFolder.file(file, data, {
                        base64: true
                    });

                }
            }


        }

    },

    createFunction: function(restApiName, label, bucket, role) {
        var functionName = restApiName + '-invoke';

        var params = {
            Code: {
                S3Bucket: bucket,
                S3Key: 'swaggy-lambda/' + restApiName + '/' + label + '/' + functionName + '.zip',
            },
            FunctionName: functionName,
            Handler: 'main.invoke',
            Role: role,
            Runtime: 'nodejs',
            Description: 'Main lambda function for ' + restApiName,
            MemorySize: 128,
            Publish: false,
            Timeout: 10
        };

        console.log('lambda createFunction', params);

        return lambda.createFunction(params).promise();
    },
    updateFunction: function(arn, restApiName, label, bucket, role) {
        var functionName = restApiName + '-invoke';


        var params = {
            FunctionName: arn,
            Publish: false,
            S3Bucket: bucket,
            S3Key: 'swaggy-lambda/' + restApiName + '/' + label + '/' + functionName + '.zip',
        };

        return lambda.updateFunctionCode(params).then(function(result) {
            console.log('Lambda Updated', result);
            return result;
        }); // successful response
    },
    recursiveReadDir: function(path, me) {
        var retval = [];

        var files = fs.readdirSync(path);



        for (var i = 0; i < files.length; i++) {

            var stat = fs.statSync(path + '/' + files[i]);

            if (stat.isDirectory()) {
                retval.extend(me.recursiveReadDir(path + '/' + files[i]));
            } else if (!files[i].startsWith('.')) {
                retval.push(path + '/' + files[i]);
            }
        }
        return retval;
    },
    deploySwaggerFile: function(bucket, remotepath, apiUrl, version, stage) {
        var swaggerDoc = fs.readFileSync('swagger.json', 'utf8');
        var template = Handlebars.compile(swaggerDoc);

        console.log('deploySwaggerFile', bucket, remotepath, apiUrl, version, stage);


        var api = apiUrl;
        if (api.startsWith('https://')) {
            api = api.substring('https://'.length);
        }

        var data = {
            "stage": stage,
            "apiUrl": api, // TOOD - make this the api URL.
            "scheme": 'https',
            "version": version
        };

        var result = template(data);

        return s3.putObject({
            Bucket: bucket,
            ACL: 'public-read',
            Key: remotepath + '/' + version + '/swagger.' + stage + '.json',
            Body: result
        }).promise();
    },
    deployIndexHtml: function(bucket, remotepath, apiUrl, version, stage) {
        console.log('deployIndexHtml', bucket);

        var indexHtml = fs.readFileSync(__dirname + '/swagger-ui/index.html', 'utf8');

        var template = Handlebars.compile(indexHtml);


        var data = {
            "s3UrlPrefix": 's3.amazonaws.com/' + bucket + "/" + remotepath + '/' + version + '/swagger-ui',
            "stage": '/' + stage,
            "apiUrl": apiUrl
        };

        console.log('data', data);

        var result = template(data);



        return s3.putObject({
            Bucket: bucket,
            ACL: 'public-read',
            ContentType: 'text/html',
            ContentEncoding: 'utf8',
            Key: remotepath + '/' + version + '/index.' + stage + '.html',
            Body: result
        }).promise();
    },
    uploadFolder: function(bucket, remotepath, localpath, apiUrl, version) {
        //  /swagger-ui
        //
        var me = this;

        console.log('uploadFolder', bucket, remotepath, localpath, apiUrl, version);
        var files = me.recursiveReadDir(localpath, me)

        var promises = [];


        for (var i = 0; i < files.length; i++) {

            var fileData = fs.readFileSync(files[i]);


            var contentType = 'text/html';
            if (files[i].endsWith('css')) {
                contentType = 'text/css';
            } else if (files[i].endsWith('js')) {
                contentType = 'text/javascript';
            } else if (files[i].endsWith('ttf')) {
                contentType = 'application/x-font-ttf';
            }

            promises.push(s3.putObject({
                Bucket: bucket,
                ACL: 'public-read',
                ContentType: contentType,
                ContentEncoding: 'utf8',
                Key: remotepath + '/' + version + '/swagger-ui' + files[i].substring('./swagger-ui'.length),
                Body: fileData
            }).promise());
        }


        return Q.all(promises);
    },
    publishVersion: function(arn, label) {
        var params = {
            FunctionName: arn,
            Description: 'Version created ' + label
        };
        return lambda.publishVersion(params).then(function(results) {
            console.log('publishVersion', results);
            var aliasParams = {
                FunctionName: arn,
                FunctionVersion: results.Version,
                Name: label.replaceAll('.', '-'),
                Description: 'Version Alias for ' + label
            };
            console.log('createAlias', aliasParams);

            return lambda.createAlias(aliasParams).then(function(aliasResult) {
                console.log('createAliasResult', aliasResult);
                return aliasResult;
            });
        });
    },
    showPermissions: function(arn, version) {

        var me = this;

        if (version != null) {
            arn = arn + ':' + version.replaceAll('.', '-');
        }
        console.log('arn', arn);

        return lambda.getPolicy({
            FunctionName: arn
        }).then(function(getPolicyResult) {
            console.log('getPolicyResult', getPolicyResult.Policy);

        }).catch(function(err) {
            console.log("should be ok, no existing permissions")
        });


    },
    createRole: function(roleName) {
        var assumeRolePolicyDocument = {
            "Version": "2012-10-17",
            "Statement": [{
                "Action": "sts:AssumeRole",
                "Effect": "Allow",
                "Principal": {
                    "Service": "lambda.amazonaws.com"
                }
            }]
        };

        var params = {
            AssumeRolePolicyDocument: JSON.stringify(assumeRolePolicyDocument, null, '\t'),
            RoleName: roleName
        };
        
        return iam.createRole(params).then(function(roleResult) {
            

            // Attach a basic execution policy to the role  
            policyDocument = {
                "Version": "2012-10-17",
                "Statement": [{
                    "Action": [
                        "logs:CreateLogGroup",
                        "logs:CreateLogStream",
                        "logs:PutLogEvents"
                    ],
                    "Resource": "arn:aws:logs:*:*:*",
                    "Effect": "Allow"
                }]
            };

            var rolePolicyParams = {
                RoleName: roleName,
                PolicyName: roleName + '-Basic-Execution-' + Math.floor(Math.random() * 100000000),
                PolicyDocument: JSON.stringify(policyDocument, null, '\t')
            };

            return iam.putRolePolicy(rolePolicyParams).then(function(rolePolicyResult) {
                console.log('Created Basic Lambda Execution Role: ', roleResult.Role.Arn);

                return roleResult.Role.Arn;
            }).catch(function(err) {
                console.log('ERROR attaching policy', err);
            });
        });

    }
}
