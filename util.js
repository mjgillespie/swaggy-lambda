var fs = require('fs');


module.exports = {

    parseSwaggerFile: function(swaggerFile) {
        var me = this;

        try {
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

                        var response = {};


                        if (method.toLowerCase() == 'get' || method.toLowerCase() == 'put') {
                            response = swagger.paths[path][method]['responses']['200'];
                        } else if (method.toLowerCase() == 'post') {
                            response = swagger.paths[path][method]['responses']['201'];
                        }


                    }
                }
            }
            return {
                resources: resources,
                paths: resourcePaths,
                definitions: swagger.definitions
            };
        } catch (ex) {
            console.log("exception:", ex);
        }
    },
    dereference: function(item, tree, callstack) {
        var me = this;


        for (var i in item) {
            console.log('i', i, item);
            if (i == '$ref') {
                console.log('i', i, item[i]);
                /* 
                                for (var j = 0; j < callstack.length; j++) {
                                    if (item[i] == callstack[j]) {
                                        return;
                                    }
                                }

                                var ref = item[i];

                                if (ref[0] == '#') {
                                    ref = ref.substring(1);
                                }
                                if (ref[0] == '/') {
                                    ref = ref.substring(1);
                                }


                                var path = ref.split('/');
                                var currentItem = tree;

                                for (var j = 0; j < path.length; j++) {
                                    currentItem = currentItem[path[j]];
                                }

                                console.log('currentItem', JSON.string(currentItem, null, '\t'));

                                callstack = JSON.parse(JSON.stringify(callstack));
                                callstack.push(ref)


                                for (var child in currentItem) {
                                    item[child] = currentItem[child]
                                }

                                delete item['$ref'];
                */
            } else {
                me.dereference(item[i], tree, callstack);
            }
        }

    }
}
