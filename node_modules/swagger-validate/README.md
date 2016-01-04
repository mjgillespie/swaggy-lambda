# Validate Swagger Objects
[![Build Status](https://travis-ci.org/signalfx/swagger-validate.svg?branch=master)](https://travis-ci.org/signalfx/swagger-validate)

A detailed validation provider for [Swagger](https://github.com/wordnik/swagger-spec/blob/master/versions/1.2.md) objects.

Given a relevant Swagger spec, this tool will provide detailed information about any validation errors which can be
caught automatically. This is useful for catching invalid requests to a server on the client-side before a call is
ever issues. Currently, these objects can be validated according to their Swagger specification:
* [Models](https://github.com/wordnik/swagger-spec/blob/master/versions/1.2.md#527-model-object) (supports inheritance)
* [Operations](https://github.com/wordnik/swagger-spec/blob/master/versions/1.2.md#523-operation-object)
* [Data types](https://github.com/wordnik/swagger-spec/blob/master/versions/1.2.md#433-data-type-fields)

## Basic Example
```javascript
var catModel = {
    id: 'Cat',
    required: ['name'],
    properties: {
      name: { type: 'string' },
      age: { type: 'number' }
    }
};

var myCat = {
    name: 'Grumpy',
    age: 'blue'
};

var error = swaggerValidate.model(myCat, catModel);

console.error(error.toString());
// ValidationErrors: Cat is invalid:
//   age is invalid: "blue" is not a number (got a string instead)
```

## Installation and Use
For nodejs: `npm install swagger-validate` then use `var swaggerValidate = require('swagger-validate')` to include it in a script.

For browsers: `bower install swagger-validate` or include the `./dist/swagger-validate.js` file as a script tag to put the swaggerValidate function in the global scope. You may also `require` it with browserify or with Requirejs instead of including it as a script tag.

## API

### var error = swaggerValidate.model(object, model[, models])
Validate an object using a given model spec.

#### Parameters
* *object* - the instance to validate against the defined model
* *model* - the model to use when validating the object
* *models* - optional map of model names to models to be used when dereferencing linked models (such as $refs or inherited properties).

#### Returns
* *error* or *undefined* - if a validation error is found, a ValidationErrors object will be returned with the details of the error(s).

### swaggerValidate.errors.ValidationErrors
The primary error object emitted by the validator with the following properties:
* *name* - The name of the error (always 'ValidationErrors')
* *message* - A human readable message of the error
* *specName* - The name of the specification object used for the validation
* *spec* - The specification used for the validation (such as a model or an operation object)
* *value* - The object which failed the validation
* *errors* - A list of ValidationError objects for each invalid field in the given object.

### swaggerValidate.errors.ValidationError
This is the wrapper around individual validation errors. Each invalid field in a given object will have one ValidationError object within the ValidationErrors.errors list.

* *name* - The name of the error (always 'ValidationError')
* *message* - A human readable message of the error
* *specName* - The name of the specification object used for the validation
* *spec* - The specification used for the validation (such as a model property or an operation parameter)
* *error* - A subtype of DataTypeValidationError object with specific error details.

### swaggerValidate.errors.DataValidationError
This is a super class for the individual validation errors that can occur in properties. Here's a full list of the different types, all which are accessable via swaggerValidate.errors[*name of error*]:
* *NotAStringError* - The value was expected to be a string but wasn't.
* *NotABooleanError* - The value was expected to be a boolen but wasn't.
* *NotAnArrayError* - The value was expected to be an array but wasn't.
* *NotVoidError* - The value was expected to be void but wasn't.
* *NotANumberError* - The value was expected to be a number but wasn't.
* *NotAnIntegerError* - The value was a number but not an integer as expected.
* *NumberTooLargeError* - The value was a number but over the maximum value allowed by the model.
* *NumberTooSmallError* - The value was a number but under the minumum value allowed by the model.
* *DuplicateInSetError* - The value is an array which has duplicates, which is not allowed by the model.
* *ErrorsInArrayElementsError* - Errors occurred within the elements of an array. Depending on the type of an array these errors may be of ValidationErrors type or subtypes of DataValidationErrors.
* *MissingValueError* - The value is required by the model but doesn't exist.

## Developing
After installing [nodejs](http://nodejs.org) execute the following:

```shell
git clone https://github.com/signalfx/swagger-validate.git
cd swagger-validate
npm install
npm run dev
```
The build engine will test and build everything, start a server hosting the `example` folder on [localhost:3000](http://localhost:3000), and watch for any changes and rebuild when nescessary.

To generate minified files in `dist`:
```shell
npm run dist
```
