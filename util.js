var fs = require('fs');


module.exports = {

    parseSwaggerFile: function(swaggerFile) {
        var swagger = JSON.parse(fs.readFileSync(swaggerFile, 'utf8'));

        // does an 'api' folder exist? If not, make one.

        var resources = {};
        var resourcePaths = {};

        for (var path in swagger.paths) {


            var pathParts = path.split('/');

            var pos = pathParts.length - 1;
            var resourceName = pathParts[pos];
            var endsWithResourceId = false;

            while (pos > 0 && resourceName[0] == '{' && resourceName[resourceName.length - 1] == '}') {
                pos--;

                resourceName = pathParts[pos];
                endsWithResourceId = true;
            }

            var expressPath = path.split('/');

            for (var i = 0; i < expressPath.length; i++) {
                var part = expressPath[i];

                if (part[0] == '{' && part[part.length - 1] == '}') {
                    part = ':' + part.substring(1, part.length - 1);
                    expressPath[i] = part;
                }
            }
            expressPath = expressPath.join('/');

            if (resources[resourceName] == null) {
                resources[resourceName] = {
                    methods: {}
                };
            }

            if (resourcePaths[expressPath] == null) {
                resourcePaths[expressPath] = {};
            }
            // does a resourceName.js file exist in api?



            for (var method in swagger.paths[path]) {
                if (method != "parameters") {
                    var parameters = swagger.paths[path][method].parameters;

                    if (swagger.paths[path].parameters != null) {
                        parameters = JSON.parse(JSON.stringify(swagger.paths[path].parameters));
                    } else {
                        parameters = [];
                    }

                    var methodParameters = swagger.paths[path][method].parameters;
                    if (methodParameters != null) {
                        for (var j = 0; j < methodParameters.length; j++) {
                            var found = false;

                            for (var k = 0; k < parameters.length; k++) {
                                if (parameters[k].name == methodParameters[j].name) {
                                    found = true;
                                    parameters[k] = methodParameters[j];
                                    break;
                                }
                            }
                            if (!found) {
                                parameters.push(methodParameters[j]);
                            }
                        }
                    }


                    if (method.toLowerCase() == 'get' && !endsWithResourceId) {
                        resources[resourceName].methods.list = expressPath; //true; // swagger.paths[path][method];
                        resourcePaths[expressPath].get = {
                            resource: resourceName,
                            method: 'list',
                            parameters: parameters
                        };

                    } else {
                        resources[resourceName].methods[method] = expressPath; //true; //swagger.paths[path][method];
                        resourcePaths[expressPath][method] = {
                            resource: resourceName,
                            method: method,
                            parameters: parameters
                        };
                    }

                    resourcePaths[expressPath][method].parameterMap = {};

                    for (var i = 0; i < resourcePaths[expressPath][method].parameters.length; i++) {
                        var paramItem = resourcePaths[expressPath][method].parameters[i];

                        resourcePaths[expressPath][method].parameterMap[paramItem.name.toLowerCase()] = paramItem;
                    }

                }
            }
        }
        return {
            resources: resources,
            paths: resourcePaths,
            definitions: swagger.definitions
        };
    }
}
