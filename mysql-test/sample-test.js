var should = require('chai').should();
var https
var fs = require('fs');
var packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
var conf = packageJson['swagger-lamba'];
var stage = '/build'
var apiUrl = conf.restApiId + '.execute-api.us-east-1.amazonaws.com';
var port = 443;

var app = require('../app.js');

var apiKey;

var env = 'remote';


for (var index in process.argv) {
    var str = process.argv[index];

    console.log('argv', index, str);

    if (str.indexOf("--local") == 0) {
        env = 'local';
    }
}

if (env == 'local') {
    https = require('http');
    apiUrl = 'localhost';
    port = 3000;
    stage = ''

    apiKey = conf.stages.local.apiKey;

    app(3000).listen(3000, function() {

    });



} else {
    https = require('https');
    apiKey = conf.stages.build.apiKey;
}



describe("Test the build stage for the sample application", function() {
    this.timeout(5000);

    var options = {};
    var model1Id = 0;

    before(function(done) {
        https.get({
                hostname: apiUrl,
                port: port,
                method: 'GET',
                path: stage + '/model1',
                headers: {
                    'Content-Type': 'application/json',
                    'Accepts': 'application/json',
                    'x-api-key': apiKey
                }
            },
            function(res) {


                res.on('data', function(d) {

                    var jsonData = JSON.parse(d);

                    if (Array.isArray(jsonData) && jsonData.length > 0) {

                        model1Id = jsonData[0].id;
                        console.log('Data already exists. model1Id:', model1Id);



                        done();
                    } else {
                        console.log('NEED TO ADD SAMPLE DATA');
                        done();
                    }



                });


            })

    });


    beforeEach(function() {
        options = {
            hostname: apiUrl,
            port: port,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accepts': 'application/json',
                'x-api-key': apiKey
            }
        }
    });

    describe("Test get methods", function() {

        var tests = [{
            name: 'Test Model 1 Get - No Params',
            path: stage + '/model1',
            statusCode: 200
        }, {
            name: 'Test Model 1 Get By Id',
            path: stage + '/model1/model1Id',
            statusCode: 200,
            contentRange: '0-0/1'
        }, {
            name: 'Test Model 1 Get By Id - notfound',
            path: stage + '/model1/notfound',
            statusCode: 404
        }]; //'



        tests.forEach(function(test) {



            it(test.name, function(done) {

                test.path = test.path.replace('model1Id', model1Id);


                options.path = test.path;

                if (test.options != null) {
                    for (var key in test.options) {
                        options[key] = test.options[key];
                    }
                }

                if (test.headers != null) {
                    for (var key in test.headers) {
                        options.headers[key] = test.headers[key];
                    }


                }
                https.get(options, function(res) {
                    res.statusCode.should.equal(test.statusCode);

                    if (test.statusCode >= 200 && test.statusCode <= 299) {
                        res.setEncoding('utf8');


                        res.on('data', function(d) {
                            var jsonData = JSON.parse(d);
                            // jsonData.length.should.equal(4);

                            if (test.retval != null) {
                                var jsonString = JSON.stringify(jsonData, null, '\t');
                                var expectedReturnValue = JSON.stringify(test.retval, null, '\t');
                                jsonString.should.equal(expectedReturnValue);
                            }

                            done();
                        });
                    } else {
                        done();
                    }
                });
            });
        });

    });



    describe("Test post/put methods", function() {
        this.timeout(5000);

        var tests = [{
            name: 'Test Model 1 Post',
            method: 'POST',
            path: stage + '/model1',
            postData: {
                "id": 0,
                "integercode": 10,
                "description": "sample",
                "displayName": "sample"
            },
            statusCode: 201
        }, {
            name: 'Test Model 1 Put By Id',
            method: 'PUT',
            path: stage + '/model1/model1Id',
            postData: {
                "id": 0,
                "integercode": 10,
                "description": "sample",
                "displayName": "sample"
            },
            statusCode: 200
        }]; //'path: 



        tests.forEach(function(test) {
            it(test.name, function(done) {
                options.path = test.path.replace('model1Id', model1Id);
                options.method = test.method;

                if (test.options != null) {
                    for (var key in test.options) {
                        options[key] = test.options[key];
                    }
                }

                var req = https.request(options, function(res) {
                    res.statusCode.should.equal(test.statusCode);

                    res.setEncoding('utf8');
                    res.on('data', function(d) {
                        done();
                    });
                });

                req.write(JSON.stringify(test.postData));
                req.end();
            });
        });

    });

});
