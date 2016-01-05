var AWS = require('aws-sdk');
var Q = require('q');
var awsQ = require('aws-q');
var util = require('./util.js');
var uuid = require('node-uuid');
var swagger = util.parseSwaggerFile('./swagger.json');
var lambda = new AWS.Lambda();

awsQ(AWS);

AWS.config.region = 'us-east-1';

AWS.config.apiVersions = {
    s3: '2006-03-01',
    apigateway: '2015-07-09'

    // other service API versions
};

var apigateway = new AWS.APIGateway();

module.exports = {
    initializeGateway: function(apiName, apiDescription) {
        var params = {
            name: apiName,
            description: apiDescription
        };
        return apigateway.createRestApi(params).promise();
    },

    deleteResources: function(restApiId) {
        return apigateway.getResources({
                restApiId: restApiId
            })
            .then(function(data) {


                    var deleteItems = []

                    for (var i = 0; i < data.items.length; i++) {
                        var resource = data.items[i];

                        if (resource.parentId == null) {
                            rootId = resource.id;
                        }
                    }

                    if (rootId != null) {
                        for (var i = 0; i < data.items.length; i++) {
                            var resource = data.items[i];
                            if (resource.parentId == rootId) {
                                deleteItems.push(apigateway.deleteResource({
                                    resourceId: resource.id,
                                    restApiId: restApiId
                                }).promise());
                            };
                        }

                    }

                    return Q.all(deleteItems).then(function() {
                        return {
                            restApiId: restApiId,
                            rootId: rootId
                        };
                    });
                } // successful response
            )
    },
    createResources: function(restApiId, lambdaArn, awsAcctId) {
        var me = this;


        return apigateway.getResources({
            restApiId: restApiId,
            limit: 100
        }).then(function(result) {



            var promise = new Q();
            var promiseList = [];
            var rootResource = me.getRootResource(result.items);
            var pathTree = me.preparePaths(swagger.paths);


            for (var resource in pathTree) {
                promiseList.push(me.createResource(restApiId, resource, pathTree[resource], rootResource, lambdaArn, awsAcctId));
            }

            return Q.all(promiseList);
        });
    },
    preparePaths: function(paths) {
        var tree = {};


        if (paths[0] == '/') {
            paths = paths.substring(1);
        }

        for (var path in paths) {


            var pathParts = path.split('/');
            var subtree = tree;
            var lastResource = "";
            var pathpart = pathParts[i];


            for (var i = 0; i < pathParts.length; i++) {
                pathpart = pathParts[i];


                if (pathpart != '') {

                    if (pathpart[0] == ':') {
                        pathpart = '{' + pathParts[i].substring(1) + '}';
                        pathParts[i] = pathpart;
                    } else {
                        lastResource = pathpart;
                    }


                    if (subtree[pathpart] == null) {
                        subtree[pathpart] = {};
                    }


                    if (i < (pathParts.length - 1)) {
                        if (subtree[pathpart].items == null) {
                            subtree[pathpart].items = {};
                        }
                        subtree = subtree[pathpart].items;
                    }
                }

            }

            subtree[pathpart].resource = lastResource;
            subtree[pathpart].methods = paths[path];
            subtree[pathpart].path = pathParts.join('/');
            subtree[pathpart].normalizedPath = path;

        }

        return tree;
    },
    getRoot: function(restApiId) {


        return apigateway.getResources({
            restApiId: restApiId,
            limit: 100
        }).then(function(result) {
            var resources = result.items;

            for (var i = 0; i < resources.length; i++) {
                if (resources[i].parentId == null) {
                    return resources[i]
                }
            }
            return null;
        });
    },
    getRootResource: function(resources) {

        for (var i = 0; i < resources.length; i++) {
            if (resources[i].parentId == null) {
                return resources[i]
            }
        }
        return null;
    },

    createResource: function(restApiId, resource, pathTree, parent, lambdaArn, awsAcctId, contentType) {
        var me = this;

        return apigateway.createResource({
            restApiId: restApiId,
            parentId: parent.id,
            pathPart: resource
        }).then(function(newResource) {
            var childPromises = [];

            for (var methodName in pathTree.methods) {

                childPromises.push(me.createMethod(restApiId, methodName, pathTree.resource, newResource.id, pathTree.methods[methodName], contentType,
                    pathTree.path, pathTree.normalizedPath, lambdaArn, awsAcctId));
            }

            var children = []

            for (var child in pathTree.items) {
                children.push(child);
            }




            return Q.all(childPromises).then(function(result) {
                var promise = Q(0);

                return me.promiseSequence(promise, children, me, function(item) {

                    var child = children[item];

                    return me.createResource(restApiId, child, pathTree.items[child], newResource, lambdaArn, awsAcctId)
                        .then(function(result) {
                            return item + 1;
                        });

                }).then(function() {
                    console.log('resource completed:', pathTree.path);
                    return newResource;
                });
            });
        })
    },
    promiseSequence: function(promise, list, me, callback) {
        return promise.then(function(item) {
            if (item < list.length) {
                return callback(item).then(function(result) {
                    return me.promiseSequence(new Q(item + 1), list, me, callback)
                });
            } else {
                return 'done';
            }
        });
    },

    createMethod: function(restApiId, method, resource, resourceId, methodInfo, contentType, path, normalizedPath, lambdaArn, awsAcctId) {
        var methodParameters = {};
        var intgParameters = '';
        var me = this;
        var integration

        var intgParameterJson = {
            "resource": resource,
            "method": method,
            "params": {},
            "path": normalizedPath,
            "body": "~BODY~"
        };

        for (var j = 0; j < methodInfo.parameters.length; j++) {
            var p = methodInfo.parameters[j];

            var location = "querystring"

            if (p.in == "path") {
                location = "path";
            } else if (p.in == "header") {
                location = "header";
            }

            var paramName = "method.request." + location + "." + p.name;

         //   if (p.in != 'body') {
                methodParameters[paramName] = false //p.required;
         //   }

            intgParameterJson.params[p.name] = "$input.params('" + p.name + "')";
            //  intgParameters = intgParameters + "\"" + p.name + "\": \"$input.params('" + p.name + "')\""
        }
        var replaceString = "$input.json('$')";
        intgParameters = JSON.stringify(intgParameterJson, null, '\t');

        var splitStr = intgParameters.split('"~BODY~"');

        intgParameters = splitStr[0] + replaceString + splitStr[1];

        var apiKeyRequired = (methodInfo['x-swagger-proxy'] == null);

        console.log('apiKeyRequired:', apiKeyRequired);

        var params = {
            authorizationType: 'NONE',
            httpMethod: method.toUpperCase(),
            resourceId: resourceId,
            restApiId: restApiId,
            apiKeyRequired: apiKeyRequired,
            requestModels: {},
            requestParameters: methodParameters
        };
        return apigateway.putMethod(params).then(function(putResult) {
            return me.putIntegration(restApiId, method, resourceId, methodInfo, contentType, path, lambdaArn, awsAcctId, intgParameters);
        });
    },
    putIntegration: function(restApiId, method, resourceId, methodInfo, contentType, path, lambdaArn, awsAcctId, intgParameters) {
        var methodType = "AWS";
        var requestParameters = {};
        var integrationHttpMethod = "POST";
        var uri = "";
        var passthroughResponse = false;
        var me = this;

        var promise = Q();

        if (methodInfo['x-swagger-proxy'] != null) {
            methodType = "HTTP";
            integrationHttpMethod = "GET";
            uri = methodInfo['x-swagger-proxy'];
            passthroughResponse = true;


        } else {
            uri = 'arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/' + lambdaArn + '/invocations'
        }


        var params = {
            httpMethod: method.toUpperCase(),
            resourceId: resourceId,
            restApiId: restApiId,
            type: methodType,
            cacheKeyParameters: [],
            cacheNamespace: resourceId,
            credentials: null,
            integrationHttpMethod: integrationHttpMethod,
            requestParameters: requestParameters,
            requestTemplates: {
                "application/json": intgParameters
            },
            uri: uri
        }


        return promise.then(function() {
            return apigateway.putIntegration(params).then(function(intgResult) {
                var putIntegrationResponses = [];

                var successCode = '200';

                if (method.toUpperCase() == 'POST') {
                    successCode = '201';
                } else if (method.toUpperCase() == 'DELETE') {
                    successCode = '204';
                }


                var intgPromise = me.putIntegrationResponse(method.toUpperCase(), resourceId, restApiId, passthroughResponse, contentType, successCode);

                if (!passthroughResponse) {
                    intgPromise = intgPromise.then(function() {
                        return me.putIntegrationResponse(method.toUpperCase(), resourceId, restApiId, passthroughResponse, contentType, '404');
                    });
                    intgPromise = intgPromise.then(function() {
                        return me.putIntegrationResponse(method.toUpperCase(), resourceId, restApiId, passthroughResponse, contentType, '422');
                    });
                }

                if (methodType == "AWS") {
                    var sourceArn = 'arn:aws:execute-api:us-east-1:' + awsAcctId + ':' + restApiId + '/*/' + method.toUpperCase() + path;
                    //arn:aws:execute-api:us-east-1:033374767009:fdq9qngqk2/*/{{HTTPMETHOD}}
                    var addPermissionParams = {
                        FunctionName: lambdaArn,
                        StatementId: 'apigateway-access' + uuid.v4(),
                        Principal: 'apigateway.amazonaws.com',
                        SourceArn: sourceArn,
                        Action: 'lambda:InvokeFunction'
                    };

                    intgPromise = intgPromise.then(function() {
                        return lambda.addPermission(addPermissionParams).then(function(result) {

                            console.log('Permission added:', addPermissionParams);
                            return result;
                        });
                    });
                }

                return intgPromise;
            })
        });
    },

    putIntegrationResponse: function(httpMethod, resourceId, restApiId, passthroughResponse, contentType, statusCode) {

        var responseTemplate = "$input.json('$.data')";
        var selectionPattern = "^$";
        var responseModels = {};
        var me = this;
        var responseParameters = {
            "method.response.header.Content-Range": "integration.response.body.contentRange"
        };


        if (passthroughResponse) {
            selectionPattern = "";
        }

        if (statusCode == '404') {
            selectionPattern = "notfound.*";
            responseTemplate = "#set($inputRoot = $input.path('$'))\n"
        } else if (statusCode == '422') {
            selectionPattern = "validationerror.*";
            responseTemplate = "#set($inputRoot = $input.path('$'))\n#set($errors = $inputRoot.errorMessage.substring(16))\n{\n  \"message\" : \"validationError\",\n  \"errors\"  : $errors\n}";

        }

        var responseTemplates = {
            "application/json": responseTemplate
        };

        if (passthroughResponse) {
            responseTemplates = {};
        }

        if (contentType != null) {
            responseTemplates = {};
            responseParameters = {};
            responseTemplates[contentType] = null;
            responseModels[contentType] = 'Empty';
        }


        var params = {
            httpMethod: httpMethod,
            resourceId: resourceId,
            restApiId: restApiId,
            statusCode: statusCode,
            responseParameters: responseParameters,
            responseTemplates: responseTemplates,
            selectionPattern: selectionPattern
        }

        var responseParams = {
            httpMethod: httpMethod,
            resourceId: resourceId,
            restApiId: restApiId,
            statusCode: statusCode,
            responseModels: responseModels,
            responseParameters: {
                "method.response.header.Content-Range": true
            }
        }

        return apigateway.putMethodResponse(responseParams).then(function(intgResp) {


            return apigateway.putIntegrationResponse(params).promise();

        });
    },
    testSwaggerEndpoint: function(restApiId, resourceId) {
        console.log('testing result', restApiId, resourceId);
        var params = {
            httpMethod: 'GET',
            restApiId: restApiId,
            resourceId: resourceId,
            stageVariables: {
                stage: 'build'
            }
        };
        return apigateway.testInvokeMethod(params).then(function(result) {
                console.log('test result', result);

                return result;
            })
            .catch(function(err) {
                console.log('test error', err);
            });
    },
    deployStage: function(restApiId, stage, version, variables) {


        return apigateway.getDeployments({
            restApiId: restApiId,
            limit: 500
        }).then(function(result) {
            var deploymentId = "";
            for (var i = 0; i < result.items.length; i++) {
                var deployment = result.items[i];


                if (deployment.description == version) {
                    //create the stage for this deployment
                    deploymentId = deployment.id;
                    break;
                }
            }

            var getStageParams = {
                restApiId: restApiId,
                stageName: stage
            };
            var stageVariables = {
                stage: stage,
                version: version
            }

            if (variables != null) {
                for (var key in variables) {
                    stageVariables[key] = variables[key];
                }
            }

            console.log('getStage', getStageParams);
            return apigateway.getStage(getStageParams)
                .then(function(stageInfo) {

                    console.log('stageInfo', stageInfo);
                    var patchOperations = [{
                        op: 'replace',
                        path: '/deploymentId',
                        value: deploymentId
                    }];

                    for (var key in stageVariables) {
                        if (stageInfo.variables[key] != null) {
                            delete stageInfo.variables[key];
                        }

                        patchOperations.push({
                            op: 'replace',
                            path: '/variables/' + key,
                            value: stageVariables[key]
                        });
                    }

                    for (var key in stageInfo.variables) {
                        patchOperations.push({
                            op: 'remove',
                            path: '/variables/' + key
                        });
                    }


                    console.log('patchOperations', patchOperations);
                    return apigateway.updateStage({
                        restApiId: restApiId,
                        stageName: stage,
                        patchOperations: patchOperations
                    }).then(function(createStageResult) {

                        console.log('updateStageResult', createStageResult);
                        return createStageResult;
                    });
                })
                .catch(function(err) {
                    // stage does not exist, create it
                    console.log('getstage error', err);
                    return apigateway.createStage({
                        deploymentId: deploymentId,
                        restApiId: restApiId,
                        stageName: stage,
                        variables: stageVariables
                    }).then(function(createStageResult) {

                        console.log('createStageResult', createStageResult);
                        return createStageResult;
                    });
                })

        })
    },

    createDeployment: function(restApiId, stage, version) {
        var me = this;

        var params = {
            restApiId: restApiId,
            stageName: stage,
            description: version,
            stageDescription: stage,
            variables: {
                stage: stage,
                version: version
            }
        };

        console.log('deploy', params);

        return apigateway.createDeployment(params).then(function(results) {
            me.cleanDeploys(restApiId, restApiId);
        }); // successful response

    },
    cleanDeploys: function(restApiId, currentDeployment) {
        var params = {
            restApiId: restApiId,
            limit: 500
        };
        return apigateway.getDeployments(params).then(function(result) {

            var promises = [];
            for (var i = 0; i < result.items.length; i++) {
                var deployment = result.items[i];


                if (deployment.description == 'latest') {
                    if (currentDeployment.id != deployment.id) {

                        var deleteParams = {
                            deploymentId: deployment.id,
                            restApiId: restApiId
                        };
                        promises.push(apigateway.deleteDeployment(deleteParams));

                    } else {

                    }
                }
            }
            return Q.all(promises);
        });
    },
    setPermissions: function(restApiId, lambdaArn, awsAcctId) {
        var me = this;

        return apigateway.getResources({
                restApiId: restApiId
            })
            .then(function(data) {


                var resourceMethods = []

                var promises = []

                console.log('setPermissions - Sequencial');

                for (var i = 0; i < data.items.length; i++) {
                    var resource = data.items[i];
                    for (var method in resource.resourceMethods) {
                        console.log('resource1', resource.path, method, lambdaArn);
                        resourceMethods.push({
                            path: resource.path,
                            method: method
                        });
                    }
                }

                var promise = Q(0);

                return me.promiseSequence(promise, resourceMethods, me, function(item) {

                    var resourceMethod = resourceMethods[item];
                    var sourceArn = 'arn:aws:execute-api:us-east-1:' + awsAcctId + ':' + restApiId + '/*/' + resourceMethod.method.toUpperCase() + resourceMethod.path;

                    var addPermissionParams = {
                        FunctionName: lambdaArn,
                        StatementId: 'apigateway-access' + uuid.v4(),
                        Principal: 'apigateway.amazonaws.com',
                        SourceArn: sourceArn,
                        Action: 'lambda:InvokeFunction'
                    };

                    return lambda.addPermission(addPermissionParams)
                        .then(function(result) {
                            console.log('resource3', result);

                            return item + 1;
                        });

                }).then(function(result) {
                    return result;
                });


            })
    },
    listKeys: function() {
        return apigateway.getApiKeys({}).then(function(result) {
            console.log('getApiKeys', JSON.stringify(result, null, '\t'));

            return result;
        });
    },
    createApiKey: function(params) {
        return apigateway.createApiKey(params);
    }
}
