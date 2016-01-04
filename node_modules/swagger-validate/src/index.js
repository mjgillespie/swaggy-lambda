exports.dataType = require('./validateDataType');
exports.model = require('./validateModel');
exports.operation = require('./validateOperation');
exports.array = require('./validateArray');
exports.errors = require('./errorTypes');

var primitives = require('./validatePrimitiveTypes');
exports.primitive = {
  integer: primitives.validateInteger,
  number: primitives.validateNumber,
  string: primitives.validateString,
  boolean: primitives.validateBoolean,
  void: primitives.validateVoid,
  file: primitives.validateFile
};
