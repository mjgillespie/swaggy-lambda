var express = require('express');
var fs = require('fs');
var lambdaInvoke = require('./lambda-invoke.js');
var util = require('./util.js');
var bodyParser = require('body-parser');
var Handlebars = require('handlebars');
var swagger = util.parseSwaggerFile('swagger.json');

var stage = 'local';

if (process.env.NODE_ENV != null) {
    stage = process.env.NODE_ENV;
}



//console.log('swagger:', JSON.stringify(swagger, null, '\t'));

module.exports = function(port) {
    var app = express();
    app.use(bodyParser.json());

    var conf = JSON.parse(fs.readFileSync('package.json', 'utf8'))['swagger-lamba'].stages[stage];

    if (conf == null) {
        conf = {
            apiKey: "1234567890"
        };
    }


    for (var resource in swagger.resources) {
        var swaggerResource = swagger.resources[resource];

        for (var method in swaggerResource.methods) {
            var expressPath = swaggerResource.methods[method];
            var methodName = method;

            if (methodName == 'list') {
                methodName = 'get';
            }



            app[methodName](expressPath, function(req, res) {

                if (conf.apiKey != null && req.headers['x-api-key'] != conf.apiKey) {
                    res.status(403).send();
                    return;
                }

                var thisMethod = "";

                for (var routeMethod in req.route.methods) {
                    thisMethod = routeMethod;
                }



                // find the resource for req.path
                var info = swagger.paths[req.route.path]

                var params = {};

                for (var p in req.query) {
                    params[p] = req.query[p];
                }

                for (var p in req.params) {
                    params[p] = req.params[p];
                }

                for (var p in req.headers) {
                    if (info[thisMethod].parameterMap[p.toLowerCase()] != null) {
                        var pItem = info[thisMethod].parameterMap[p];
                        params[pItem.name] = req.headers[p];
                    }
                }

                var params = {
                    resource: info[thisMethod].resource,
                    method: thisMethod,
                    params: params,
                    path: req.route.path,
                    body: req.body
                };


                lambdaInvoke.invoke(params, {
                    done: function(err, data) {
                        var code = 200;

                        if (thisMethod.toUpperCase() == 'POST') {
                            code = 201;
                        } else if (thisMethod.toUpperCase() == 'DELETE') {
                            code = 204;
                        }

                        if (err != null) {
                            if (err == "notfound") {
                                res.status(404).send();
                            } else if (err.startsWith('validationerror:')) {
                                err = JSON.parse(err.substring('validationerror:'.length));
                                res.status(422).send(err);
                            } else {
                                res.status(500).send(err);
                            }
                        } else {
                            if (data.contentRange != null) {
                                res.set('Content-Range', data.contentRange);
                            }
                            res.status(code).send(data.data, req, res);
                        }


                    },
                    succeed: function(data) {
                        this.done(null, data);
                    },
                    fail: function(err) {
                        this.done(err, null);
                    }
                });


            });
        }

    }

    app.use('/swagger-ui', express.static('swagger-ui'));

    app.get("/docs", function(req, res) {
        var htmlTemplate = fs.readFileSync('swagger-ui/index.html', 'utf8');


        var template = Handlebars.compile(htmlTemplate);


        var data = {
            "s3UrlPrefix": 'localhost:' + port + '/swagger-ui',
            "stage": '',
            "apiUrl": 'http://localhost:' + port
        };
        var result = template(data);

        res.set('Content-Type', 'text/html');

        res.send(result, req, res);


    });

    app.get("/swagger", function(req, res) {

        var swaggerTemplate = fs.readFileSync('swagger.json', 'utf8');


        var template = Handlebars.compile(swaggerTemplate);


        var data = {
            "stage": '',
            "apiUrl": 'localhost:' + port,
            "scheme": 'http',
            "version": "latest"
        };
        var result = template(data);

        res.set('Content-Type', 'application/json');

        res.send(result, req, res);

    });


    console.log('http://localhost:' + port + '/docs?apiKey=' + conf.apiKey);

    return app;
}
