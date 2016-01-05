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
            name: 'Test Model 1 Get - Single Param',
            path: stage + '/model1?param1=required',
            contentRange: '0-3/40',
            statusCode: 200
        }, {
            name: 'Test Model 1 Get - Missing Param',
            path: stage + '/model1',
            statusCode: 422
        }, {
            name: 'Test Model 1 Get - Invalid Param',
            path: stage + '/model1?param1=required&param2=101',
            statusCode: 422
        }, {
            name: 'Test Model 1 Get - No API Key',
            path: stage + '/model1?param1=required',
            contentRange: '0-3/40',
            options: {
                headers: {
                    'Content-Type': 'application/json',
                    'Accepts': 'application/json'
                }
            },
            statusCode: 403
        }, {
            name: 'Test Model 1 Get By Id',
            path: stage + '/model1/sampleId',
            statusCode: 200,
            contentRange: '0-0/1'
        }, {
            name: 'Test Model 1 Get By Id - notfound',
            path: stage + '/model1/notfound',
            statusCode: 404
        }, {
            name: 'Test Model 2 Get',
            path: stage + '/model1/example/model2',
            statusCode: 200,
            contentRange: '0-0/1'
        }, {
            name: 'Test Model 2 Get - test Model1 Id length not overridden',
            path: stage + '/model1/123456789/model2',
            statusCode: 200,
            contentRange: '0-0/1'
        }, {
            name: 'Test Model 3 Get',
            path: stage + '/model3',
            statusCode: 200,
            contentRange: '0-0/1'
        }, {
            name: 'Test Model 4 Get with default',
            path: stage + '/model4',
            statusCode: 200,
            contentRange: '0-0/1',
            retval: [{
                resource: 'model4',
                value1: 'something'
            }]
        }, {
            name: 'Test Model 4 Get override default',
            path: stage + '/model4?value1=notdefault',
            statusCode: 200,
            contentRange: '0-0/1',
            retval: [{
                resource: 'model4',
                value1: 'notdefault'
            }]
        }, {
            name: 'Test Model 5 Get test header param',
            path: stage + '/model5',
            statusCode: 200,
            contentRange: '0-0/1',
            headers: {
                value1: 'something'
            },
            retval: [{
                resource: 'model5',
                value1: 'something'
            }]
        }, {
            name: 'Test Model 5 Get test required header missing',
            path: stage + '/model5',
            statusCode: 422
        }]; //'



        tests.forEach(function(test) {
            it(test.name, function(done) {
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

                        res.headers['content-range'].should.equal(test.contentRange);


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
                "id": "test",
                "integercode": 10,
                "description": "sample",
                "displayName": "sample"
            },
            statusCode: 201
        }, {
            name: 'Test Model 1 Post - invalid data',
            method: 'POST',
            path: stage + '/model1',
            postData: {
                "id": "test",
                "integercode": "ABC",
                "description": "sample",
                "displayName": "sample"
            },
            statusCode: 422
        }, {
            name: 'Test Model 1 Put By Id',
            method: 'PUT',
            path: stage + '/model1/44',
            postData: {
                "id": "test",
                "integercode": 10,
                "description": "sample",
                "displayName": "sample"
            },
            statusCode: 200
        }, {
            name: 'Test Model 1 Put By Id - Invalid Data',
            method: 'PUT',
            path: stage + '/model1/44',
            postData: {
                "id": "test",
                "integercode": "ABC",
                "description": "sample",
                "displayName": "sample"
            },
            statusCode: 422
        }, {
            name: 'Test Model 2 Post',
            method: 'POST',
            path: stage + '/model1/333/model2',
            postData: {
                "type": "sample1",
                "state": 0,
                "status": "sample",
                "lastUpdated": "string",
                "dateCreated": "string",
                "submodel": {
                    "id": "string",
                    "value1": "string"
                }
            },
            statusCode: 201
        }, {
            name: 'Test Model 2 Post - Invalid long model1 id. Overridden parameter',
            method: 'POST',
            path: stage + '/model1/123456789/model2',
            postData: {
                "type": "sample1",
                "state": 0,
                "status": "sample",
                "lastUpdated": "string",
                "dateCreated": "string",
                "submodel": {
                    "id": "string",
                    "value": "string"
                }
            },
            statusCode: 422
        }]; //'path: 



        tests.forEach(function(test) {
            it(test.name, function(done) {
                options.path = test.path;
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

describe("Test Swagger parameter types", function() {
    this.timeout(5000);

    var options = {}

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

    var testCases = [{
        type: 'Int32',
        param: 'pInteger',
        validValues: [0, -10000, '-10000', 2147483647, -2147483648],
        invalidValues: ['A', 2147483648, -2147483649, 3.1, -1.1]
    }, {
        type: 'Int64',
        param: 'pLong',
        validValues: [0, -10000, '-10000', 2147483647, 2147483648, -2147483648, -2147483649,
            '9223372036854776000', '-9223372036854776000'
        ],
        invalidValues: ['A', '9223372036854777000', '-9223372036854777000', 3.1, -1.1]
    }, {
        type: 'Float',
        param: 'pFloat',
        validValues: [0, -10000, '-10000', 2147483647, -2147483648, 3.1, -1.1],
        invalidValues: ['A']
    }, {
        type: 'Double',
        param: 'pDouble',
        validValues: [0, -10000, '-10000', 2147483647, -2147483648, 3.1, -1.1],
        invalidValues: ['A']
    }, {
        type: 'String',
        param: 'pString',
        validValues: [0, 'A', '-10000', 'ABCDEFGIJKLMNOP&', '%?~', 'AOK'],
        invalidValues: []
    }, {
        type: 'Base64',
        param: 'bByte',
        validValues: ['SGVsbG8gV29ybGQ=', 'SGVsbG8gV29ybGQzMQ=='],
        invalidValues: [0, 1.1, 'A', 'SGVsbG8gV29ybGQzMQ=']
    }, {
        type: 'Boolean',
        param: 'pBoolean',
        validValues: ['true', 'false', true, false],
        invalidValues: ['X', 'T']
    }, {
        type: 'Date',
        param: 'pDate',
        validValues: ['2015-12-31', '2016-01-31', '2016-02-29', '2000-02-29'],
        invalidValues: ['2016-01-32', '2016-02-30', '2015-02-29', '2015-12-31T11:52', '1900-02-29']
    }, {
        type: 'DateTime',
        param: 'pDateTime',
        validValues: ['2015-12-31T11:52:00+00:00', '2015-12-31T11:52:00.0001+00:00', '2015-12-31T11:52:00Z'],
        invalidValues: ['2015-12-31', '2016-01-31', '2016-02-29', '2016-01-32', '2016-02-30', '2015-02-29']
    }, {
        type: 'Password String',
        param: 'pPassword',
        validValues: [0, 'A', '-10000', 'ABCDEFGIJKLMNOP&', '%?~', 'AOK'],
        invalidValues: []
    }, {
        type: 'Int32 Header',
        param: 'pHeader',
        type: 'header',
        validValues: [0, -10000, '-10000', 2147483647, -2147483648],
        invalidValues: ['A', 2147483648, -2147483649, 3.1, -1.1]
    }];
    //


    testCases.forEach(function(testParam) {
        describe("Testing parameters " + testParam.type, function() {
            var testData = [];
            testParam.validValues.forEach(function(value) {
                testData.push({
                    isValid: true,
                    value: value
                });
            });
            testParam.invalidValues.forEach(function(value) {
                testData.push({
                    isValid: false,
                    value: value
                });
            });



            testData.forEach(function(test) {
                it('Test value ' + test.value + ' is ' + (test.isValid ? 'valid' : 'invalid'), function(done) {
                    var queryParams = '';
                    var headers = {
                        'Content-Type': 'application/json',
                        'Accepts': 'application/json',
                        'x-api-key': apiKey
                    };

                    if (testParam.type != null && testParam.type == 'header') {
                        headers[testParam.param] = test.value;
                    } else {
                        queryParams = '?' + testParam.param + '=' + encodeURIComponent(test.value);
                    }

                    var options = {
                        hostname: apiUrl,
                        port: port,
                        path: stage + '/model3' + queryParams,
                        method: 'GET',
                        headers: headers
                    }
                    var expectedStatusCode = test.isValid ? 200 : 422;

                    https.get(options, function(res) {
                        res.statusCode.should.equal(expectedStatusCode);
                        done();
                    });
                });
            });
        });
    });

});
describe("Testing body validations ", function() {
    this.timeout(5000);

    var options = {};
    var item = {};

    beforeEach(function() {
        options = {
            hostname: apiUrl,
            port: port,
            path: stage + '/model5',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accepts': 'application/json',
                'x-api-key': apiKey
            }
        };

        item = {
            id: 'testrun1',
            value1: 'string',
            value2: 1,
            value3: '2015-12-31'
        };


    });

    var testCases = [{
        description: 'success',
        statusCode: 201,
        data: {}
    }, {
        description: 'invalid param2 - above max',
        statusCode: 422,
        data: {
            value2: 101
        }
    }, {
        description: 'invalid param1 - too short',
        statusCode: 422,
        data: {
            value1: ""
        }
    }, {
        description: 'invalid param3 - invalid date',
        statusCode: 422,
        data: {
            value3: '02/30/2016'
        }
    }];

    testCases.forEach(function(test) {
        it(test.description, function(done) {

            for (var v in test.data) {
                item[v] = test.data[v];

                if (item[v] == null) {
                    delete item[v];
                }
            }

            var req = https.request(options, function(res) {

                res.statusCode.should.equal(test.statusCode);

                res.setEncoding('utf8');
                res.on('data', function(d) {


                    done();
                });
            });

            req.write(JSON.stringify(item));
            req.end();

        });

    });


});
