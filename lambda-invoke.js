var util = require('./util.js');
var ZSchema = require("z-schema");
var stringValidator = require('validator');

var validator = new ZSchema({});

var swagger = util.parseSwaggerFile('swagger.json');

String.prototype.replaceAll = function(find, replace) {
    var str = this;
    return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};

ZSchema.registerFormat("int32", function(str) {

    return (!isNaN(str) &&
        ((Number(str) % 1) === 0) &&
        (Number(str) >= -2147483648) &&
        (Number(str) <= 2147483647));
});
ZSchema.registerFormat("int64", function(str) {

    var maxValue = Math.pow(2, 63) - 1;
    var minValue = -1 * Math.pow(2, 63);


    return (!isNaN(str) &&
        ((Number(str) % 1) === 0) &&
        (Number(str) >= minValue) &&
        (Number(str) <= maxValue));
});

ZSchema.registerFormat("float", function(str) {
    return (!isNaN(str));
});
ZSchema.registerFormat("double", function(str) {
    return (!isNaN(str));
});
ZSchema.registerFormat("byte", function(str) {
    return stringValidator.isBase64(str);
});
ZSchema.registerFormat("boolean", function(str) {
    return stringValidator.isBoolean(str);
});
ZSchema.registerFormat("password", function(str) {
    return true;
});

ZSchema.registerFormat("date", function(str) {
    var regex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/

    return regex.test(str) && stringValidator.isDate(str);
});

ZSchema.registerFormat("date-time", function(str) {
    var regex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2})(\.\d{4})?([+-](\d{2})\:(\d{2})|Z)$/

    return regex.test(str) && stringValidator.isDate(str);
});
//



var helper = {
    getResource: function(resource) {
        return require('./api/' + resource);
    },

    convertParameter: function(parameter) {
        var retval = {};

        if (parameter.type == "boolean") {

            parameter.type = "string";
            parameter.format = "boolean";
        }

        for (var key in parameter) {
            switch (key) {
                case "type":
                case "maximum":
                case "exclusiveMaximum":
                case "minimum":
                case "exclusiveMinimum":
                case "maxLength":
                case "minLength":
                case "format":
                case "pattern":
                case "maxItems":
                case "minItems":
                case "uniqueItems":
                case "enum":
                case "multipleOf":
                    retval[key] = parameter[key];
                    break;
                case "required":
                    retval[key] = [parameter.name];
                    break;
            }
        }

        return retval;
    },
    decodeValidationError: function(error, name) {

        if (error.code === 'OBJECT_MISSING_REQUIRED_PROPERTY') {
            return error.params[0];
        }

        var path = error.path;

        if (path == '#/') {
            return name;
        }

        if (path[0] == '#' && path[1] == '/') {
            path = path.substring(2);
        }
        return path.replaceAll('/', '.');

    },

    resolveSchema: function(schema, name) {
        var path = schema['$ref'];

        if (path == '#/') {
            return name;
        }

        if (path[0] == '#' && path[1] == '/') {
            path = path.substring(2);
        }

        return path.replaceAll('/', '.');
    }
}

module.exports = {
    setHelper: function(callback) { // used for testing, inversion of control, need a better pattern
        helper.getResource = callback;
    },


    invoke: function(event, context) {
        var me = this;

        var resourceHandler = helper.getResource(event.resource);

        event.validationErrors = [];
        var validator = new ZSchema({});

        var parameters = swagger.paths[event.path][event.method].parameters;


        for (var i = 0; i < parameters.length; i++) {
            var parameter = parameters[i];

            var paramValue = event.params[parameter.name];
            if (parameter['in'] == "body") {
                paramValue = event.body;
            }


            // Since the API gateway always passes a string, even if it wasn't supplied
            // TODO: try to have the API Gateway parameter mapping smart enough so you
            // can distinguist between a NULL and empty string in the paramter.
            if (paramValue == '') {
                paramValue = null;
            }



            if (paramValue == null && parameter['default'] != null) {

                paramValue = parameter['default'];
                event.params[parameter.name] = paramValue;


            }

            if (paramValue != null && (parameter.type == 'integer' || parameter.type == 'number')) {


                paramValue = Number(paramValue);

            }

            var isValid = true;

            if (parameter.schema != null) {

                var schemaPath = helper.resolveSchema(parameter.schema);


                isValid = validator.validate(paramValue, swagger, {
                    schemaPath: schemaPath
                });

            } else {
                // primative eval    

                if ((parameter.required == true || parameter.required == 'true') && paramValue == null) {
                    event.validationErrors.push({
                        type: 'OBJECT_MISSING_REQUIRED_PROPERTY',
                        message: 'Required Parameter ' + parameter.name + ' is missing.',
                        fieldname: parameter.name
                    });
                }

                if (paramValue != null) {
                    isValid = validator.validate(paramValue, helper.convertParameter(parameter), swagger);
                }
            }


            if (!isValid) {
                var errors = validator.getLastErrors();
                for (var j = 0; j < errors.length; j++) {


                    event.validationErrors.push({
                        type: errors[j].code,
                        message: errors[j].message,
                        fieldname: helper.decodeValidationError(errors[j], parameter.name)
                    });



                    console.log('event.validationErrors', schemaPath, event.validationErrors);

                }
            }
        }

        var lamdaMethod = swagger.paths[event.path][event.method].method;

        context.oldDone = context.done;


        context.done = function(err, obj) {

            if ((err != null) && err.type == 'validationerror') {
                err = 'validationerror:' + JSON.stringify(err.errors);
            }

            context.oldDone(err, obj)
        }

        context.oldSucceed = context.succeed;

        context.succeed = function(obj) {


            if (obj != null && obj.data == null && obj.count == null) {
                obj = {
                    count: 1,
                    start: 0,
                    totalCount: 1,
                    data: obj
                }
            }

            if (obj.contentRange == null) {
                var end = obj.start + obj.count - 1;
                obj.contentRange = obj.start + '-' + end + '/' + obj.totalCount;
            }

            return context.oldSucceed(obj);
        }




        if (resourceHandler.validate != null) {
            resourceHandler.validate(lamdaMethod, event);
        }



        if (event.validationErrors.length > 0) {
            context.done({
                type: 'validationerror',
                errors: event.validationErrors
            });
        } else {
            resourceHandler[lamdaMethod](event, context);
        }
    }

}
