var lambdaInvoke = require('../lambda-invoke.js');
var should = require('chai').should();

beforeEach(function() {
    lambdaInvoke.setHelper(function(resource, context) {
        return {
            list: function(event, context) {
                if (event.validationErrors.length > 0) {
                    context.fail({
                        type: 'validationerror',
                        errors: event.validationErrors
                    });
                } else {
                    context.succeed('Hi');
                }
            },
            get: function(event, context) {
                if (event.validationErrors.length > 0) {
                    context.fail({
                        type: 'validationerror',
                        errors: event.validationErrors
                    });
                } else {
                    if (event.params.id == 'notfound') {
                        context.fail('notfound');
                    } else {
                        context.succeed({
                            hello: 'world'
                        });
                    }
                }
            },
            put: function(event, context) {
                if (event.validationErrors.length > 0) {
                    context.fail({
                        type: 'validationerror',
                        errors: event.validationErrors
                    });
                } else {
                    context.succeed('Hi');
                }
            },
            post: function(event, context) {
                if (event.validationErrors.length > 0) {
                    context.fail({
                        type: 'validationerror',
                        errors: event.validationErrors
                    });
                } else {
                    context.succeed('Hi');
                }
            },
            delete: function(event, context) {
                if (event.validationErrors.length > 0) {
                    context.fail({
                        type: 'validationerror',
                        errors: event.validationErrors
                    });
                } else {
                    context.succeed('Hi');
                }
            },
            validate: function(method, event) {
                if (event.body.state && event.body.state == 99999) {
                    event.validationErrors.push({
                        type: 'CUSTOM_ERRROR',
                        message: 'This is some custom error, state == 99999',
                        fieldname: 'state'
                    });
                }
            }
        };
    });
});


function ContextMock(callback) {
    this.succeed = function(obj) {
        this.done(null, obj);
    };

    this.fail = function(err) {
        this.done(err, null);
    };

    this.done = function(err, obj) {

        if (err != null && err.startsWith('validationerror:')) {
            err = JSON.parse(err.substring('validationerror:'.length));
        }

        this.doneCallback(err, obj);
    };
    this.doneCallback = callback;
}

describe("Perform Validations against swagger for 'route1'", function() {
    it('Test Get - Empty Params', function(done) {
        params = {
            resource: 'resource',
            method: 'get',
            params: {
                param1: 'required'
            },
            path: '/route1',

            body: {}
        };

        var contextMock = new ContextMock(function(err, obj) {
            should.not.exist(err);
            done();
        });

        lambdaInvoke.invoke(params, contextMock);
    });
    it('Test Get', function(done) {
        params = {
            resource: 'resource',
            method: 'get',
            params: {
                param1: 'required',
                param2: 40,
                param3: 101,
                param4: "123456789",
                param5: "Item1"
            },
            path: '/route1',
            body: {}
        };

        var contextMock = new ContextMock(function(err, obj) {
            should.not.exist(err);
            done();
        });

        lambdaInvoke.invoke(params, contextMock);
    });

    it('Test Get with empty strings', function(done) {
        params = {
            resource: 'resource',
            method: 'get',
            params: {
                param1: 'required',
                param2: '',
                param3: '',
                param4: '',
                param5: ''
            },
            path: '/route1',
            body: {}
        };

        var contextMock = new ContextMock(function(err, obj) {
            should.not.exist(err);
            done();
        });

        lambdaInvoke.invoke(params, contextMock);
    });


    it('Test Maximum and Minimum field size', function(done) {
        params = {
            resource: 'resource',
            method: 'get',
            params: {
                param1: 'required',
                param2: 101,
                param3: "0"
            },
            path: '/route1',
            body: {}
        };

        var contextMock = new ContextMock(function(err, obj) {
            err.should.have.length(2);
            err.should.be.deep.equal([{
                "fieldname": "param2",
                "type": "MAXIMUM",
                message: 'Value 101 is greater than maximum 100'
            }, {
                "fieldname": "param3",
                "type": "MINIMUM",
                message: 'Value 0 is less than minimum 100'
            }])

            done();
        });

        lambdaInvoke.invoke(params, contextMock);

    });

    it('Test Maximum field length', function(done) {
        params = {
            resource: 'resource',
            method: 'get',
            params: {
                param1: 'required',
                param2: 50,
                param3: 100,
                param4: "12345678901"
            },
            path: '/route1',
            body: {}
        };

        var contextMock = new ContextMock(function(err, obj) {
            err.should.have.length(1);
            err.should.be.deep.equal([{
                "fieldname": "param4",
                "type": "MAX_LENGTH",
                message: 'String is too long (11 chars), maximum 10'
            }])
            done();
        });
        lambdaInvoke.invoke(params, contextMock);

    });


    it('Test Minimum field length', function(done) {
        params = {
            resource: 'resource',
            method: 'get',
            params: {
                param1: 'required',
                param2: 50,
                param3: 100,
                param4: "1234567"
            },
            path: '/route1',
            body: {}
        };

        var contextMock = new ContextMock(function(err, obj) {
            err.should.have.length(1);
            err.should.be.deep.equal([{
                "fieldname": "param4",
                "type": "MIN_LENGTH",
                message: 'String is too short (7 chars), minimum 8'
            }])
            done();
        });
        lambdaInvoke.invoke(params, contextMock);
    });

    it('Test value not in list', function(done) {
        params = {
            resource: 'resource',
            method: 'get',
            params: {
                param1: 'required',
                param2: 50,
                param3: 100,
                param4: "12345678",
                param5: "THIS WILL FAIL"
            },
            path: '/route1',
            body: {}
        };

        var contextMock = new ContextMock(function(err, obj) {
            err.should.have.length(1);
            err.should.be.deep.equal([{
                "fieldname": "param5",
                "type": "ENUM_MISMATCH",
                message: 'No enum match for: THIS WILL FAIL'
            }])
            done();
        });
        lambdaInvoke.invoke(params, contextMock);


    });

    it('Test parseable string in a number field', function(done) {
        params = {
            resource: 'resource',
            method: 'get',
            params: {
                param1: 'required',
                param2: '50',
                param3: 100
            },
            path: '/route1',
            body: {}
        };


        var contextMock = new ContextMock(function(err, obj) {
            should.not.exist(err);
            done();
        });

        lambdaInvoke.invoke(params, contextMock);

    });
});

describe("Perform Validations against swagger for '/route1/id'", function() {
    it('Test Get', function(done) {
        params = {
            resource: 'resource',
            method: 'get',
            params: {
                id: 'test'
            },
            path: '/route1/:id',
            body: {}
        };


        var contextMock = new ContextMock(function(err, obj) {
            should.not.exist(err);
            done();
        });

        lambdaInvoke.invoke(params, contextMock);

    });

    it('Test Get - Not found', function(done) {
        params = {
            resource: 'resource',
            method: 'get',
            params: {
                id: 'notfound'
            },
            path: '/route1/:id',
            body: {}
        };


        var contextMock = new ContextMock(function(err, obj) {
            err.should.equal('notfound');
            done();
        });

        lambdaInvoke.invoke(params, contextMock);

    });

    it('Test Put', function(done) {
        params = {
            resource: 'resource',
            method: 'put',
            params: {
                id: 'test'
            },
            path: '/route1/:id',
            body: {
                "id": "abc123",
                "integercode": 133232,
                "description": "A description",
                "displayName": "Something fun"
            }
        };


        var contextMock = new ContextMock(function(err, obj) {
            should.not.exist(err);
            done();
        });

        lambdaInvoke.invoke(params, contextMock);

    });
    it('Test Put with invalid data', function(done) {
        params = {
            resource: 'resource',
            method: 'put',
            params: {
                id: 'test'
            },
            path: '/route1/:id',
            body: {
                "id": 222,
                "integercode": "133232"
            }
        };

        var contextMock = new ContextMock(function(err, obj) {
            err.should.have.length(2);
            err[0].should.be.deep.equal({
                "fieldname": "integercode",
                "type": "INVALID_TYPE",
                message: 'Expected type integer but found type string'
            })
            done();
        });
        lambdaInvoke.invoke(params, contextMock);


    });



});


describe("Perform Validations against swagger for '/route1/modelId/route2'", function() {
    it('Test Get', function(done) {
        params = {
            resource: 'resource',
            method: 'get',
            params: {
                modelId: 'test'
            },
            path: '/route1/:modelId/route2',
            body: {}
        };


        var contextMock = new ContextMock(function(err, obj) {
            should.not.exist(err);
            done();
        });

        lambdaInvoke.invoke(params, contextMock);
    });

    it('Test Post', function(done) {
        params = {
            resource: 'resource',
            method: 'post',
            params: {
                modelId: 'test'
            },
            path: '/route1/:modelId/route2',
            body: {
                "type": "abc123",
                "state": 1,
                "status": "A description",
                "lastUpdated": "11/12/2015",
                "dateCreated": "11/12/2015"
            }

        };


        var contextMock = new ContextMock(function(err, obj) {
            should.not.exist(err);
            done();
        });

        lambdaInvoke.invoke(params, contextMock);
    });

    it('Test Post with submodel data', function(done) {
        params = {
            resource: 'resource',
            method: 'post',
            params: {
                modelId: 'test'
            },
            path: '/route1/:modelId/route2',
            body: {
                "type": "abc123",
                "state": 1,
                "status": "A description",
                "lastUpdated": "11/12/2015",
                "dateCreated": "11/12/2015",
                "submodel": {
                    "id": "12345",
                    "value": "Fun!"
                }
            }

        };


        var contextMock = new ContextMock(function(err, obj) {
            should.not.exist(err);
            done();
        });

        lambdaInvoke.invoke(params, contextMock);

    });

    it('Test Post with invalid submodel data', function(done) {
        params = {
            resource: 'resource',
            method: 'post',
            params: {
                modelId: 'test'
            },
            path: '/route1/:modelId/route2',
            body: {
                "type": "abc123",
                "state": 1,
                "status": "A description",
                "lastUpdated": "11/12/2015",
                "dateCreated": "11/12/2015",
                "submodel": {
                    "id": "12345678901",
                    "value": "Fun!"
                }
            }

        };

        var contextMock = new ContextMock(function(err, obj) {
            err.should.have.length(1);
            err[0].should.be.deep.equal({
                "fieldname": "submodel.id",
                "type": "MAX_LENGTH",
                message: 'String is too long (11 chars), maximum 10'
            });
            done();
        });
        lambdaInvoke.invoke(params, contextMock);



    });

    it('Test Post with invalid data', function(done) {
        params = {
            resource: 'resource',
            method: 'post',
            params: {
                modelId: 'test'
            },
            path: '/route1/:modelId/route2',
            body: {
                "type": "a123",
                "state": 5,
                "status": "A description"
            }

        };

        var contextMock = new ContextMock(function(err, obj) {
            err.should.have.length(2);
            err[0].should.be.deep.equal({
                "fieldname": "dateCreated",
                "type": "OBJECT_MISSING_REQUIRED_PROPERTY",
                message: 'Missing required property: dateCreated'
            });
            done();
        });
        lambdaInvoke.invoke(params, contextMock);

    });

    it('Test Post with missing dates', function(done) {
        params = {
            resource: 'resource',
            method: 'post',
            params: {
                modelId: 'test'
            },
            path: '/route1/:modelId/route2',
            body: {
                "type": "a123",
                "state": "created",
                "status": "A description",
                "lastUpdated": "11/12/2015",
                "dateCreated": "11/12/2015"
            }

        };


        var contextMock = new ContextMock(function(err, obj) {
            err.should.have.length(1);
            err[0].should.be.deep.equal({
                "fieldname": "state",
                "type": "INVALID_TYPE",
                message: 'Expected type integer but found type string'
            });
            done();
        });
        lambdaInvoke.invoke(params, contextMock);

    });

    it('Test Post with excessively long type', function(done) {
        params = {
            resource: 'resource',
            method: 'post',
            params: {
                modelId: 'test'
            },
            path: '/route1/:modelId/route2',
            body: {
                "type": "a1234567890",
                "state": 4,
                "status": "A description",
                "lastUpdated": "11/12/2015",
                "dateCreated": "11/12/2015"
            }

        };


        var contextMock = new ContextMock(function(err, obj) {
            err.should.have.length(1);
            err[0].should.be.deep.equal({
                "fieldname": "type",
                "type": "MAX_LENGTH",
                message: 'String is too long (11 chars), maximum 10'
            });
            done();
        });
        lambdaInvoke.invoke(params, contextMock);


    });

    it('Test Post with custom validation error', function(done) {
        params = {
            resource: 'resource',
            method: 'post',
            params: {
                modelId: 'test'
            },
            path: '/route1/:modelId/route2',
            body: {
                "type": "abc123",
                "state": 99999,
                "status": "A description",
                "lastUpdated": "11/12/2015",
                "dateCreated": "11/12/2015",
                "submodel": {
                    "id": "12345",
                    "value": "Fun!"
                }
            }

        };

        var contextMock = new ContextMock(function(err, obj) {
            err.should.have.length(1);
            err[0].should.be.deep.equal({
                "fieldname": "state",
                "type": "CUSTOM_ERRROR",
                message: 'This is some custom error, state == 99999'
            });
            done();
        });
        lambdaInvoke.invoke(params, contextMock);

    });

});
