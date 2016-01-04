!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.swaggerValidate=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

function DataTypeValidationError(message){
  this.name = 'DataTypeValidationError';
  this.message = message || 'Invalid data type';
}
DataTypeValidationError.prototype = Object.create(Error.prototype);
DataTypeValidationError.prototype.constructor = DataTypeValidationError;
exports.DataTypeValidationError = DataTypeValidationError;

function NotAnIntegerError(value){
  this.name = 'NotAnIntegerError';
  this.message = '"' + value + '" is not an integer';
  this.value = value;
}
NotAnIntegerError.prototype = Object.create(DataTypeValidationError.prototype);
NotAnIntegerError.prototype.constructor = NotAnIntegerError;
exports.NotAnIntegerError = NotAnIntegerError;

function NotANumberError(value, actualType){
  this.name = 'NotANumberError';
  this.message = '"' + value + '" is not a number';
  if(actualType) this.message += ' (got a ' + actualType + ' instead)';

  this.value = value;
}
NotANumberError.prototype = Object.create(DataTypeValidationError.prototype);
NotANumberError.prototype.constructor = NotANumberError;
exports.NotANumberError = NotANumberError;

function NumberTooLargeError(value, max){
  this.name = 'NumberTooLargeError';
  this.message = '"' + value + '" is above the maximum of ' + max.toString();
  this.value = value;
}
NumberTooLargeError.prototype = Object.create(DataTypeValidationError.prototype);
NumberTooLargeError.prototype.constructor = NumberTooLargeError;
exports.NumberTooLargeError = NumberTooLargeError;

function NumberTooSmallError(value, max){
  this.name = 'NumberTooSmallError';
  this.message = '"' + value + '" is above the maximum of ' + max.toString();
  this.value = value;
}
NumberTooSmallError.prototype = Object.create(DataTypeValidationError.prototype);
NumberTooSmallError.prototype.constructor = NumberTooSmallError;
exports.NumberTooSmallError = NumberTooSmallError;

function NotABooleanError(value, actualType){
  this.name = 'NotABooleanError';
  this.message = '"' + value + '" is not a boolean';
  if(actualType) this.message += ' (got a ' + actualType + ' instead)';

  this.value = value;
}
NotABooleanError.prototype = Object.create(DataTypeValidationError.prototype);
NotABooleanError.prototype.constructor = NotABooleanError;
exports.NotABooleanError = NotABooleanError;

function NotAnArrayError(value, actualType){
  this.name = 'NotAnArrayError';
  this.message = '"' + value + '" is not an array';
  if(actualType) this.message += ' (got a ' + actualType + ' instead)';

  this.value = value;
}
NotAnArrayError.prototype = Object.create(DataTypeValidationError.prototype);
NotAnArrayError.prototype.constructor = NotAnArrayError;
exports.NotAnArrayError = NotAnArrayError;

function DuplicateInSetError(arr, dupes){
  this.name = 'DuplicateInSetError';
  this.message = 'Duplicates ("' + dupes.join('", "') + '") found in set: ["' + arr.join('", "') + '"';
  this.dupes = dupes;
  this.value = arr;
}
DuplicateInSetError.prototype = Object.create(DataTypeValidationError.prototype);
DuplicateInSetError.prototype.constructor = DuplicateInSetError;
exports.DuplicateInSetError = DuplicateInSetError;

function NotVoidError(value, actualType){
  this.name = 'NotVoidError';
  this.message = '"' + value + '" is not null or undefined';
  if(actualType) this.message += ' (got a ' + actualType + ' instead)';

  this.value = value;
}
NotVoidError.prototype = Object.create(DataTypeValidationError.prototype);
NotVoidError.prototype.constructor = NotVoidError;
exports.NotVoidError = NotVoidError;

function NotAStringError(value, actualType){
  this.name = 'NotAStringError';
  this.message = '"' + value + '" is not a string';
  if(actualType) this.message += ' (got a ' + actualType + ' instead)';

  this.value = value;
}
NotAStringError.prototype = Object.create(DataTypeValidationError.prototype);
NotAStringError.prototype.constructor = NotAStringError;
exports.NotAStringError = NotAStringError;

function StringNotInEnumError(value, acceptableValues){
  this.name = 'StringNotInEnumError';
  this.message = '"' + value + '" is not an acceptable value: "' + acceptableValues.join('", "') + '"';
 
  this.value = value;
}
StringNotInEnumError.prototype = Object.create(DataTypeValidationError.prototype);
StringNotInEnumError.prototype.constructor = StringNotInEnumError;
exports.StringNotInEnumError = StringNotInEnumError;


function ErrorsInArrayElementsError(errors){
  this.name = 'ErrorsInArrayElementsError';
  this.message = 'Errors in array elements:\n\t' + errors.join(',\n\t');
  this.errors = errors;
}
ErrorsInArrayElementsError.prototype = Object.create(DataTypeValidationError.prototype);
ErrorsInArrayElementsError.prototype.constructor = ErrorsInArrayElementsError;
exports.ErrorsInArrayElementsError = ErrorsInArrayElementsError;

function MissingValueError(){
  this.name = 'MissingValueError';
  
  this.message = 'This value is required but missing';
}
MissingValueError.prototype = Object.create(DataTypeValidationError.prototype);
MissingValueError.prototype.constructor = MissingValueError;
exports.MissingValueError = MissingValueError;

function ValidationError(specName, spec, error){
  this.name = 'ValidationError';
  this.specName = specName;
  this.spec = spec;
  this.error = error;

  this.message = specName + ' is invalid: ' + error.message;
}
ValidationError.prototype = Object.create(DataTypeValidationError.prototype);
ValidationError.prototype.constructor = ValidationError;
exports.ValidationError = ValidationError;

function ValidationErrors(value, specName, spec, errors){
  this.name = 'ValidationErrors';

  this.value = value;
  this.specName = specName;
  this.spec = spec;
  this.errors = errors || [];

  this.message = specName + ' is invalid';

  if(this.errors.length){
    this.message += ':\n\t' + this.errors.map(function(e){ return e.message; }).join('\n\t');
  }
}
ValidationErrors.prototype = Object.create(DataTypeValidationError.prototype);
ValidationErrors.prototype.constructor = ValidationErrors;
exports.ValidationErrors = ValidationErrors;

},{}],2:[function(_dereq_,module,exports){
exports.dataType = _dereq_('./validateDataType');
exports.model = _dereq_('./validateModel');
exports.operation = _dereq_('./validateOperation');
exports.array = _dereq_('./validateArray');
exports.errors = _dereq_('./errorTypes');

var primitives = _dereq_('./validatePrimitiveTypes');
exports.primitive = {
  integer: primitives.validateInteger,
  number: primitives.validateNumber,
  string: primitives.validateString,
  boolean: primitives.validateBoolean,
  void: primitives.validateVoid,
  file: primitives.validateFile
};

},{"./errorTypes":1,"./validateArray":3,"./validateDataType":4,"./validateModel":5,"./validateOperation":6,"./validatePrimitiveTypes":7}],3:[function(_dereq_,module,exports){
'use strict';

var errorTypes = _dereq_('./errorTypes'),
  validate = _dereq_('./index');

function validateArray(candidate, dataType, models){
  if(!Array.isArray(candidate)){
    return new errorTypes.NotAnArrayError(candidate, typeof candidate);
  }

  var items = dataType.items;

  if(dataType.uniqueItems){
    var dupeCheck = [];
    var dupes = candidate.filter(function(value){
      var signature;
      if(items.$ref){
        signature = JSON.stringify(value);
      } else {
        signature = value;
      }
      if(dupeCheck.indexOf(signature) !== -1){
        return true;
      } else {
        dupeCheck.push(signature);
        return false;
      }
    });

    if(dupes.length) {
      return new errorTypes.DuplicateInSetError(candidate, dupes);
    }
  }

  var errors;

  if(items.$ref){
    var model = models[items.$ref];
    errors = candidate.filter(function(value){
      return validate.model(value, model, models);
    });
  } else {
    errors = candidate.filter(function(value){
      return validate.dataType(value, items, models);
    });
  }

  if(errors.length){
    return new errorTypes.ErrorsInArrayElementsError(errors);
  }
}
module.exports = validateArray;
},{"./errorTypes":1,"./index":2}],4:[function(_dereq_,module,exports){
'use strict';

var validate = _dereq_('./index');
  
function validateDataType(candidate, dataType, models){
  models = models || {};
      
  var type = dataType.type || dataType.dataType || dataType.$ref;

  switch(type){
    case 'integer':
      return validate.primitive.integer(candidate, dataType);
    case 'number':
      return validate.primitive.number(candidate, dataType);
    case 'string':
      return validate.primitive.string(candidate, dataType);
    case 'boolean':
      return validate.primitive.boolean(candidate);
    case 'array':
      return validate.array(candidate, dataType, models);
    case 'void':
      return validate.primitive.void(candidate);
    case 'File':
      return validate.primitive.file();
    default:
      // Assumed to be complex model
      var model = models[type];
      return validate.model(candidate, model, models);
  }
}
module.exports = validateDataType;
},{"./index":2}],5:[function(_dereq_,module,exports){
'use strict';

var errorTypes = _dereq_('./errorTypes'),
  ValidationError = errorTypes.ValidationError,
  ValidationErrors = errorTypes.ValidationErrors,
  MissingValueError = errorTypes.MissingValueError,
  validate = _dereq_('./index');

// http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object
function clone(obj){
    if(obj === null || obj === undefined || typeof obj !== 'object') return obj;

    if(Array.isArray(obj)) return obj.slice();

    var temp = {};

    for(var key in obj)
        temp[key] = clone(obj[key]);
    return temp;
}

function addInhertiedProperties(model, modelId, models){
  var parent;

  Object.keys(models).some(function(modelName){
    var potentialParent = models[modelName];
    if (!potentialParent.subTypes) return;

    if(potentialParent.subTypes.indexOf(modelId) !== -1){
      parent = potentialParent;
      return true;
    }
  });

  if(!parent) return;

  for(var propertyName in parent.properties){
    model.properties[propertyName] = parent.properties[propertyName];
  }
  
  if(parent.required) model.required = model.required.concat(parent.required);

  addInhertiedProperties(model, parent.id, models);
}

function validateModel(candidate, model, models){
  if(candidate === null || typeof candidate !== 'object'){
    return new ValidationErrors(candidate, model);
  }

  models = models || {};

  model = clone(model);
  if(!model.required) model.required = [];
  addInhertiedProperties(model, model.id, models);

  var errors = [];

  model.required.forEach(function(propertyName){
    if (candidate[propertyName] !== undefined) return;

    var property = model.properties[propertyName];
    var error = new MissingValueError();
    errors.push(new ValidationError(propertyName, property, error));
  });

  Object.keys(candidate).forEach(function(propertyName){
    var property = model.properties[propertyName];
    
    if(property === undefined) return;

    var error = validate.dataType(candidate[propertyName], property, models);
    if(error){
      errors.push(new ValidationError(propertyName, property, error));
    }
  });
  
  if(errors.length){
    return new ValidationErrors(candidate, model.id, model, errors);
  }
}
module.exports = validateModel;
},{"./errorTypes":1,"./index":2}],6:[function(_dereq_,module,exports){
'use strict';

var errorTypes = _dereq_('./errorTypes'),
  ValidationError = errorTypes.ValidationError,
  ValidationErrors = errorTypes.ValidationErrors,
  MissingValueError = errorTypes.MissingValueError,
  validate = _dereq_('./index');

function validateOperation(candidate, operation, models){
  var errors = [];
  
  var presentParams = operation.parameters.filter(function(param){
    if (candidate[param.name] !== undefined) return true;
    
    if (param.required) {
      var error = new MissingValueError();
      errors.push(new ValidationError(param.name, param, error));
    }

    return false;
  });

  presentParams.forEach(function(param){
    var error = validate.dataType(candidate[param.name], param, models);
    if(error){
      errors.push(new ValidationError(param.name, param, error));
    }
  });
  
  if(errors.length){
    return new ValidationErrors(candidate, operation.nickname, operation, errors);
  }
}
module.exports = validateOperation;
},{"./errorTypes":1,"./index":2}],7:[function(_dereq_,module,exports){
'use strict';

var errorTypes = _dereq_('./errorTypes');

function validateInteger(candidate, dataType){
  var error = validateNumber(candidate, dataType);
  if(error) return error;

  if(candidate % 1){
    return new errorTypes.NotAnIntegerError(candidate);
  }
}
exports.validateInteger = validateInteger;

function validateNumber(candidate, dataType){
  if(!(typeof candidate === 'number' || candidate instanceof Number) || isNaN(candidate)){
    return new errorTypes.NotANumberError(candidate, typeof candidate);
  }
  
  if((dataType.minimum !== undefined) && candidate < parseInt(dataType.minimum, 10)){
    return new errorTypes.NumberTooSmallError(candidate, dataType.minimum);
  }
  
  if((dataType.maximum !== undefined) && candidate > parseInt(dataType.maximum, 10)){
    return new errorTypes.NumberTooLargeError(candidate, dataType.maximum);
  }
}
exports.validateNumber = validateNumber;

function validateBoolean(candidate){
  if(!(typeof candidate === 'boolean' || candidate instanceof Boolean)){
    return new errorTypes.NotABooleanError(candidate, typeof candidate);
  }
}
exports.validateBoolean = validateBoolean;


function validateVoid(candidate){
  if(candidate != null){
    return new errorTypes.NotVoidError(candidate, typeof candidate);
  }
}
exports.validateVoid = validateVoid;

function validateFile(){
  // Not sure how to check this, since anything could qualify as 'File'.
}
exports.validateFile = validateFile;

function validateString(candidate, dataType){
  if(typeof candidate !== 'string' && !(candidate instanceof String)){
    return new errorTypes.NotAStringError(candidate, typeof candidate);
  }

  if('enum' in dataType){
    if(dataType.enum.indexOf(candidate) === -1) {
      return new errorTypes.StringNotInEnumError(candidate, dataType.enum);
    }
  }
}
exports.validateString = validateString;
},{"./errorTypes":1}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9vemFuL2NvZGUvc3dhZ2dlci12YWxpZGF0ZS9ub2RlX21vZHVsZXMvYm9pbGVycGxhdGUtZ3VscC9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL296YW4vY29kZS9zd2FnZ2VyLXZhbGlkYXRlL3NyYy9lcnJvclR5cGVzLmpzIiwiL1VzZXJzL296YW4vY29kZS9zd2FnZ2VyLXZhbGlkYXRlL3NyYy9pbmRleC5qcyIsIi9Vc2Vycy9vemFuL2NvZGUvc3dhZ2dlci12YWxpZGF0ZS9zcmMvdmFsaWRhdGVBcnJheS5qcyIsIi9Vc2Vycy9vemFuL2NvZGUvc3dhZ2dlci12YWxpZGF0ZS9zcmMvdmFsaWRhdGVEYXRhVHlwZS5qcyIsIi9Vc2Vycy9vemFuL2NvZGUvc3dhZ2dlci12YWxpZGF0ZS9zcmMvdmFsaWRhdGVNb2RlbC5qcyIsIi9Vc2Vycy9vemFuL2NvZGUvc3dhZ2dlci12YWxpZGF0ZS9zcmMvdmFsaWRhdGVPcGVyYXRpb24uanMiLCIvVXNlcnMvb3phbi9jb2RlL3N3YWdnZXItdmFsaWRhdGUvc3JjL3ZhbGlkYXRlUHJpbWl0aXZlVHlwZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBEYXRhVHlwZVZhbGlkYXRpb25FcnJvcihtZXNzYWdlKXtcbiAgdGhpcy5uYW1lID0gJ0RhdGFUeXBlVmFsaWRhdGlvbkVycm9yJztcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZSB8fCAnSW52YWxpZCBkYXRhIHR5cGUnO1xufVxuRGF0YVR5cGVWYWxpZGF0aW9uRXJyb3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFcnJvci5wcm90b3R5cGUpO1xuRGF0YVR5cGVWYWxpZGF0aW9uRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRGF0YVR5cGVWYWxpZGF0aW9uRXJyb3I7XG5leHBvcnRzLkRhdGFUeXBlVmFsaWRhdGlvbkVycm9yID0gRGF0YVR5cGVWYWxpZGF0aW9uRXJyb3I7XG5cbmZ1bmN0aW9uIE5vdEFuSW50ZWdlckVycm9yKHZhbHVlKXtcbiAgdGhpcy5uYW1lID0gJ05vdEFuSW50ZWdlckVycm9yJztcbiAgdGhpcy5tZXNzYWdlID0gJ1wiJyArIHZhbHVlICsgJ1wiIGlzIG5vdCBhbiBpbnRlZ2VyJztcbiAgdGhpcy52YWx1ZSA9IHZhbHVlO1xufVxuTm90QW5JbnRlZ2VyRXJyb3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShEYXRhVHlwZVZhbGlkYXRpb25FcnJvci5wcm90b3R5cGUpO1xuTm90QW5JbnRlZ2VyRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTm90QW5JbnRlZ2VyRXJyb3I7XG5leHBvcnRzLk5vdEFuSW50ZWdlckVycm9yID0gTm90QW5JbnRlZ2VyRXJyb3I7XG5cbmZ1bmN0aW9uIE5vdEFOdW1iZXJFcnJvcih2YWx1ZSwgYWN0dWFsVHlwZSl7XG4gIHRoaXMubmFtZSA9ICdOb3RBTnVtYmVyRXJyb3InO1xuICB0aGlzLm1lc3NhZ2UgPSAnXCInICsgdmFsdWUgKyAnXCIgaXMgbm90IGEgbnVtYmVyJztcbiAgaWYoYWN0dWFsVHlwZSkgdGhpcy5tZXNzYWdlICs9ICcgKGdvdCBhICcgKyBhY3R1YWxUeXBlICsgJyBpbnN0ZWFkKSc7XG5cbiAgdGhpcy52YWx1ZSA9IHZhbHVlO1xufVxuTm90QU51bWJlckVycm9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRGF0YVR5cGVWYWxpZGF0aW9uRXJyb3IucHJvdG90eXBlKTtcbk5vdEFOdW1iZXJFcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOb3RBTnVtYmVyRXJyb3I7XG5leHBvcnRzLk5vdEFOdW1iZXJFcnJvciA9IE5vdEFOdW1iZXJFcnJvcjtcblxuZnVuY3Rpb24gTnVtYmVyVG9vTGFyZ2VFcnJvcih2YWx1ZSwgbWF4KXtcbiAgdGhpcy5uYW1lID0gJ051bWJlclRvb0xhcmdlRXJyb3InO1xuICB0aGlzLm1lc3NhZ2UgPSAnXCInICsgdmFsdWUgKyAnXCIgaXMgYWJvdmUgdGhlIG1heGltdW0gb2YgJyArIG1heC50b1N0cmluZygpO1xuICB0aGlzLnZhbHVlID0gdmFsdWU7XG59XG5OdW1iZXJUb29MYXJnZUVycm9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRGF0YVR5cGVWYWxpZGF0aW9uRXJyb3IucHJvdG90eXBlKTtcbk51bWJlclRvb0xhcmdlRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTnVtYmVyVG9vTGFyZ2VFcnJvcjtcbmV4cG9ydHMuTnVtYmVyVG9vTGFyZ2VFcnJvciA9IE51bWJlclRvb0xhcmdlRXJyb3I7XG5cbmZ1bmN0aW9uIE51bWJlclRvb1NtYWxsRXJyb3IodmFsdWUsIG1heCl7XG4gIHRoaXMubmFtZSA9ICdOdW1iZXJUb29TbWFsbEVycm9yJztcbiAgdGhpcy5tZXNzYWdlID0gJ1wiJyArIHZhbHVlICsgJ1wiIGlzIGFib3ZlIHRoZSBtYXhpbXVtIG9mICcgKyBtYXgudG9TdHJpbmcoKTtcbiAgdGhpcy52YWx1ZSA9IHZhbHVlO1xufVxuTnVtYmVyVG9vU21hbGxFcnJvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKERhdGFUeXBlVmFsaWRhdGlvbkVycm9yLnByb3RvdHlwZSk7XG5OdW1iZXJUb29TbWFsbEVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE51bWJlclRvb1NtYWxsRXJyb3I7XG5leHBvcnRzLk51bWJlclRvb1NtYWxsRXJyb3IgPSBOdW1iZXJUb29TbWFsbEVycm9yO1xuXG5mdW5jdGlvbiBOb3RBQm9vbGVhbkVycm9yKHZhbHVlLCBhY3R1YWxUeXBlKXtcbiAgdGhpcy5uYW1lID0gJ05vdEFCb29sZWFuRXJyb3InO1xuICB0aGlzLm1lc3NhZ2UgPSAnXCInICsgdmFsdWUgKyAnXCIgaXMgbm90IGEgYm9vbGVhbic7XG4gIGlmKGFjdHVhbFR5cGUpIHRoaXMubWVzc2FnZSArPSAnIChnb3QgYSAnICsgYWN0dWFsVHlwZSArICcgaW5zdGVhZCknO1xuXG4gIHRoaXMudmFsdWUgPSB2YWx1ZTtcbn1cbk5vdEFCb29sZWFuRXJyb3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShEYXRhVHlwZVZhbGlkYXRpb25FcnJvci5wcm90b3R5cGUpO1xuTm90QUJvb2xlYW5FcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOb3RBQm9vbGVhbkVycm9yO1xuZXhwb3J0cy5Ob3RBQm9vbGVhbkVycm9yID0gTm90QUJvb2xlYW5FcnJvcjtcblxuZnVuY3Rpb24gTm90QW5BcnJheUVycm9yKHZhbHVlLCBhY3R1YWxUeXBlKXtcbiAgdGhpcy5uYW1lID0gJ05vdEFuQXJyYXlFcnJvcic7XG4gIHRoaXMubWVzc2FnZSA9ICdcIicgKyB2YWx1ZSArICdcIiBpcyBub3QgYW4gYXJyYXknO1xuICBpZihhY3R1YWxUeXBlKSB0aGlzLm1lc3NhZ2UgKz0gJyAoZ290IGEgJyArIGFjdHVhbFR5cGUgKyAnIGluc3RlYWQpJztcblxuICB0aGlzLnZhbHVlID0gdmFsdWU7XG59XG5Ob3RBbkFycmF5RXJyb3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShEYXRhVHlwZVZhbGlkYXRpb25FcnJvci5wcm90b3R5cGUpO1xuTm90QW5BcnJheUVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE5vdEFuQXJyYXlFcnJvcjtcbmV4cG9ydHMuTm90QW5BcnJheUVycm9yID0gTm90QW5BcnJheUVycm9yO1xuXG5mdW5jdGlvbiBEdXBsaWNhdGVJblNldEVycm9yKGFyciwgZHVwZXMpe1xuICB0aGlzLm5hbWUgPSAnRHVwbGljYXRlSW5TZXRFcnJvcic7XG4gIHRoaXMubWVzc2FnZSA9ICdEdXBsaWNhdGVzIChcIicgKyBkdXBlcy5qb2luKCdcIiwgXCInKSArICdcIikgZm91bmQgaW4gc2V0OiBbXCInICsgYXJyLmpvaW4oJ1wiLCBcIicpICsgJ1wiJztcbiAgdGhpcy5kdXBlcyA9IGR1cGVzO1xuICB0aGlzLnZhbHVlID0gYXJyO1xufVxuRHVwbGljYXRlSW5TZXRFcnJvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKERhdGFUeXBlVmFsaWRhdGlvbkVycm9yLnByb3RvdHlwZSk7XG5EdXBsaWNhdGVJblNldEVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IER1cGxpY2F0ZUluU2V0RXJyb3I7XG5leHBvcnRzLkR1cGxpY2F0ZUluU2V0RXJyb3IgPSBEdXBsaWNhdGVJblNldEVycm9yO1xuXG5mdW5jdGlvbiBOb3RWb2lkRXJyb3IodmFsdWUsIGFjdHVhbFR5cGUpe1xuICB0aGlzLm5hbWUgPSAnTm90Vm9pZEVycm9yJztcbiAgdGhpcy5tZXNzYWdlID0gJ1wiJyArIHZhbHVlICsgJ1wiIGlzIG5vdCBudWxsIG9yIHVuZGVmaW5lZCc7XG4gIGlmKGFjdHVhbFR5cGUpIHRoaXMubWVzc2FnZSArPSAnIChnb3QgYSAnICsgYWN0dWFsVHlwZSArICcgaW5zdGVhZCknO1xuXG4gIHRoaXMudmFsdWUgPSB2YWx1ZTtcbn1cbk5vdFZvaWRFcnJvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKERhdGFUeXBlVmFsaWRhdGlvbkVycm9yLnByb3RvdHlwZSk7XG5Ob3RWb2lkRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTm90Vm9pZEVycm9yO1xuZXhwb3J0cy5Ob3RWb2lkRXJyb3IgPSBOb3RWb2lkRXJyb3I7XG5cbmZ1bmN0aW9uIE5vdEFTdHJpbmdFcnJvcih2YWx1ZSwgYWN0dWFsVHlwZSl7XG4gIHRoaXMubmFtZSA9ICdOb3RBU3RyaW5nRXJyb3InO1xuICB0aGlzLm1lc3NhZ2UgPSAnXCInICsgdmFsdWUgKyAnXCIgaXMgbm90IGEgc3RyaW5nJztcbiAgaWYoYWN0dWFsVHlwZSkgdGhpcy5tZXNzYWdlICs9ICcgKGdvdCBhICcgKyBhY3R1YWxUeXBlICsgJyBpbnN0ZWFkKSc7XG5cbiAgdGhpcy52YWx1ZSA9IHZhbHVlO1xufVxuTm90QVN0cmluZ0Vycm9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRGF0YVR5cGVWYWxpZGF0aW9uRXJyb3IucHJvdG90eXBlKTtcbk5vdEFTdHJpbmdFcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOb3RBU3RyaW5nRXJyb3I7XG5leHBvcnRzLk5vdEFTdHJpbmdFcnJvciA9IE5vdEFTdHJpbmdFcnJvcjtcblxuZnVuY3Rpb24gU3RyaW5nTm90SW5FbnVtRXJyb3IodmFsdWUsIGFjY2VwdGFibGVWYWx1ZXMpe1xuICB0aGlzLm5hbWUgPSAnU3RyaW5nTm90SW5FbnVtRXJyb3InO1xuICB0aGlzLm1lc3NhZ2UgPSAnXCInICsgdmFsdWUgKyAnXCIgaXMgbm90IGFuIGFjY2VwdGFibGUgdmFsdWU6IFwiJyArIGFjY2VwdGFibGVWYWx1ZXMuam9pbignXCIsIFwiJykgKyAnXCInO1xuIFxuICB0aGlzLnZhbHVlID0gdmFsdWU7XG59XG5TdHJpbmdOb3RJbkVudW1FcnJvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKERhdGFUeXBlVmFsaWRhdGlvbkVycm9yLnByb3RvdHlwZSk7XG5TdHJpbmdOb3RJbkVudW1FcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTdHJpbmdOb3RJbkVudW1FcnJvcjtcbmV4cG9ydHMuU3RyaW5nTm90SW5FbnVtRXJyb3IgPSBTdHJpbmdOb3RJbkVudW1FcnJvcjtcblxuXG5mdW5jdGlvbiBFcnJvcnNJbkFycmF5RWxlbWVudHNFcnJvcihlcnJvcnMpe1xuICB0aGlzLm5hbWUgPSAnRXJyb3JzSW5BcnJheUVsZW1lbnRzRXJyb3InO1xuICB0aGlzLm1lc3NhZ2UgPSAnRXJyb3JzIGluIGFycmF5IGVsZW1lbnRzOlxcblxcdCcgKyBlcnJvcnMuam9pbignLFxcblxcdCcpO1xuICB0aGlzLmVycm9ycyA9IGVycm9ycztcbn1cbkVycm9yc0luQXJyYXlFbGVtZW50c0Vycm9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRGF0YVR5cGVWYWxpZGF0aW9uRXJyb3IucHJvdG90eXBlKTtcbkVycm9yc0luQXJyYXlFbGVtZW50c0Vycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEVycm9yc0luQXJyYXlFbGVtZW50c0Vycm9yO1xuZXhwb3J0cy5FcnJvcnNJbkFycmF5RWxlbWVudHNFcnJvciA9IEVycm9yc0luQXJyYXlFbGVtZW50c0Vycm9yO1xuXG5mdW5jdGlvbiBNaXNzaW5nVmFsdWVFcnJvcigpe1xuICB0aGlzLm5hbWUgPSAnTWlzc2luZ1ZhbHVlRXJyb3InO1xuICBcbiAgdGhpcy5tZXNzYWdlID0gJ1RoaXMgdmFsdWUgaXMgcmVxdWlyZWQgYnV0IG1pc3NpbmcnO1xufVxuTWlzc2luZ1ZhbHVlRXJyb3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShEYXRhVHlwZVZhbGlkYXRpb25FcnJvci5wcm90b3R5cGUpO1xuTWlzc2luZ1ZhbHVlRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWlzc2luZ1ZhbHVlRXJyb3I7XG5leHBvcnRzLk1pc3NpbmdWYWx1ZUVycm9yID0gTWlzc2luZ1ZhbHVlRXJyb3I7XG5cbmZ1bmN0aW9uIFZhbGlkYXRpb25FcnJvcihzcGVjTmFtZSwgc3BlYywgZXJyb3Ipe1xuICB0aGlzLm5hbWUgPSAnVmFsaWRhdGlvbkVycm9yJztcbiAgdGhpcy5zcGVjTmFtZSA9IHNwZWNOYW1lO1xuICB0aGlzLnNwZWMgPSBzcGVjO1xuICB0aGlzLmVycm9yID0gZXJyb3I7XG5cbiAgdGhpcy5tZXNzYWdlID0gc3BlY05hbWUgKyAnIGlzIGludmFsaWQ6ICcgKyBlcnJvci5tZXNzYWdlO1xufVxuVmFsaWRhdGlvbkVycm9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRGF0YVR5cGVWYWxpZGF0aW9uRXJyb3IucHJvdG90eXBlKTtcblZhbGlkYXRpb25FcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBWYWxpZGF0aW9uRXJyb3I7XG5leHBvcnRzLlZhbGlkYXRpb25FcnJvciA9IFZhbGlkYXRpb25FcnJvcjtcblxuZnVuY3Rpb24gVmFsaWRhdGlvbkVycm9ycyh2YWx1ZSwgc3BlY05hbWUsIHNwZWMsIGVycm9ycyl7XG4gIHRoaXMubmFtZSA9ICdWYWxpZGF0aW9uRXJyb3JzJztcblxuICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gIHRoaXMuc3BlY05hbWUgPSBzcGVjTmFtZTtcbiAgdGhpcy5zcGVjID0gc3BlYztcbiAgdGhpcy5lcnJvcnMgPSBlcnJvcnMgfHwgW107XG5cbiAgdGhpcy5tZXNzYWdlID0gc3BlY05hbWUgKyAnIGlzIGludmFsaWQnO1xuXG4gIGlmKHRoaXMuZXJyb3JzLmxlbmd0aCl7XG4gICAgdGhpcy5tZXNzYWdlICs9ICc6XFxuXFx0JyArIHRoaXMuZXJyb3JzLm1hcChmdW5jdGlvbihlKXsgcmV0dXJuIGUubWVzc2FnZTsgfSkuam9pbignXFxuXFx0Jyk7XG4gIH1cbn1cblZhbGlkYXRpb25FcnJvcnMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShEYXRhVHlwZVZhbGlkYXRpb25FcnJvci5wcm90b3R5cGUpO1xuVmFsaWRhdGlvbkVycm9ycy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBWYWxpZGF0aW9uRXJyb3JzO1xuZXhwb3J0cy5WYWxpZGF0aW9uRXJyb3JzID0gVmFsaWRhdGlvbkVycm9ycztcbiIsImV4cG9ydHMuZGF0YVR5cGUgPSByZXF1aXJlKCcuL3ZhbGlkYXRlRGF0YVR5cGUnKTtcbmV4cG9ydHMubW9kZWwgPSByZXF1aXJlKCcuL3ZhbGlkYXRlTW9kZWwnKTtcbmV4cG9ydHMub3BlcmF0aW9uID0gcmVxdWlyZSgnLi92YWxpZGF0ZU9wZXJhdGlvbicpO1xuZXhwb3J0cy5hcnJheSA9IHJlcXVpcmUoJy4vdmFsaWRhdGVBcnJheScpO1xuZXhwb3J0cy5lcnJvcnMgPSByZXF1aXJlKCcuL2Vycm9yVHlwZXMnKTtcblxudmFyIHByaW1pdGl2ZXMgPSByZXF1aXJlKCcuL3ZhbGlkYXRlUHJpbWl0aXZlVHlwZXMnKTtcbmV4cG9ydHMucHJpbWl0aXZlID0ge1xuICBpbnRlZ2VyOiBwcmltaXRpdmVzLnZhbGlkYXRlSW50ZWdlcixcbiAgbnVtYmVyOiBwcmltaXRpdmVzLnZhbGlkYXRlTnVtYmVyLFxuICBzdHJpbmc6IHByaW1pdGl2ZXMudmFsaWRhdGVTdHJpbmcsXG4gIGJvb2xlYW46IHByaW1pdGl2ZXMudmFsaWRhdGVCb29sZWFuLFxuICB2b2lkOiBwcmltaXRpdmVzLnZhbGlkYXRlVm9pZCxcbiAgZmlsZTogcHJpbWl0aXZlcy52YWxpZGF0ZUZpbGVcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBlcnJvclR5cGVzID0gcmVxdWlyZSgnLi9lcnJvclR5cGVzJyksXG4gIHZhbGlkYXRlID0gcmVxdWlyZSgnLi9pbmRleCcpO1xuXG5mdW5jdGlvbiB2YWxpZGF0ZUFycmF5KGNhbmRpZGF0ZSwgZGF0YVR5cGUsIG1vZGVscyl7XG4gIGlmKCFBcnJheS5pc0FycmF5KGNhbmRpZGF0ZSkpe1xuICAgIHJldHVybiBuZXcgZXJyb3JUeXBlcy5Ob3RBbkFycmF5RXJyb3IoY2FuZGlkYXRlLCB0eXBlb2YgY2FuZGlkYXRlKTtcbiAgfVxuXG4gIHZhciBpdGVtcyA9IGRhdGFUeXBlLml0ZW1zO1xuXG4gIGlmKGRhdGFUeXBlLnVuaXF1ZUl0ZW1zKXtcbiAgICB2YXIgZHVwZUNoZWNrID0gW107XG4gICAgdmFyIGR1cGVzID0gY2FuZGlkYXRlLmZpbHRlcihmdW5jdGlvbih2YWx1ZSl7XG4gICAgICB2YXIgc2lnbmF0dXJlO1xuICAgICAgaWYoaXRlbXMuJHJlZil7XG4gICAgICAgIHNpZ25hdHVyZSA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNpZ25hdHVyZSA9IHZhbHVlO1xuICAgICAgfVxuICAgICAgaWYoZHVwZUNoZWNrLmluZGV4T2Yoc2lnbmF0dXJlKSAhPT0gLTEpe1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGR1cGVDaGVjay5wdXNoKHNpZ25hdHVyZSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmKGR1cGVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIG5ldyBlcnJvclR5cGVzLkR1cGxpY2F0ZUluU2V0RXJyb3IoY2FuZGlkYXRlLCBkdXBlcyk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGVycm9ycztcblxuICBpZihpdGVtcy4kcmVmKXtcbiAgICB2YXIgbW9kZWwgPSBtb2RlbHNbaXRlbXMuJHJlZl07XG4gICAgZXJyb3JzID0gY2FuZGlkYXRlLmZpbHRlcihmdW5jdGlvbih2YWx1ZSl7XG4gICAgICByZXR1cm4gdmFsaWRhdGUubW9kZWwodmFsdWUsIG1vZGVsLCBtb2RlbHMpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGVycm9ycyA9IGNhbmRpZGF0ZS5maWx0ZXIoZnVuY3Rpb24odmFsdWUpe1xuICAgICAgcmV0dXJuIHZhbGlkYXRlLmRhdGFUeXBlKHZhbHVlLCBpdGVtcywgbW9kZWxzKTtcbiAgICB9KTtcbiAgfVxuXG4gIGlmKGVycm9ycy5sZW5ndGgpe1xuICAgIHJldHVybiBuZXcgZXJyb3JUeXBlcy5FcnJvcnNJbkFycmF5RWxlbWVudHNFcnJvcihlcnJvcnMpO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHZhbGlkYXRlQXJyYXk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdmFsaWRhdGUgPSByZXF1aXJlKCcuL2luZGV4Jyk7XG4gIFxuZnVuY3Rpb24gdmFsaWRhdGVEYXRhVHlwZShjYW5kaWRhdGUsIGRhdGFUeXBlLCBtb2RlbHMpe1xuICBtb2RlbHMgPSBtb2RlbHMgfHwge307XG4gICAgICBcbiAgdmFyIHR5cGUgPSBkYXRhVHlwZS50eXBlIHx8IGRhdGFUeXBlLmRhdGFUeXBlIHx8IGRhdGFUeXBlLiRyZWY7XG5cbiAgc3dpdGNoKHR5cGUpe1xuICAgIGNhc2UgJ2ludGVnZXInOlxuICAgICAgcmV0dXJuIHZhbGlkYXRlLnByaW1pdGl2ZS5pbnRlZ2VyKGNhbmRpZGF0ZSwgZGF0YVR5cGUpO1xuICAgIGNhc2UgJ251bWJlcic6XG4gICAgICByZXR1cm4gdmFsaWRhdGUucHJpbWl0aXZlLm51bWJlcihjYW5kaWRhdGUsIGRhdGFUeXBlKTtcbiAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgcmV0dXJuIHZhbGlkYXRlLnByaW1pdGl2ZS5zdHJpbmcoY2FuZGlkYXRlLCBkYXRhVHlwZSk7XG4gICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICByZXR1cm4gdmFsaWRhdGUucHJpbWl0aXZlLmJvb2xlYW4oY2FuZGlkYXRlKTtcbiAgICBjYXNlICdhcnJheSc6XG4gICAgICByZXR1cm4gdmFsaWRhdGUuYXJyYXkoY2FuZGlkYXRlLCBkYXRhVHlwZSwgbW9kZWxzKTtcbiAgICBjYXNlICd2b2lkJzpcbiAgICAgIHJldHVybiB2YWxpZGF0ZS5wcmltaXRpdmUudm9pZChjYW5kaWRhdGUpO1xuICAgIGNhc2UgJ0ZpbGUnOlxuICAgICAgcmV0dXJuIHZhbGlkYXRlLnByaW1pdGl2ZS5maWxlKCk7XG4gICAgZGVmYXVsdDpcbiAgICAgIC8vIEFzc3VtZWQgdG8gYmUgY29tcGxleCBtb2RlbFxuICAgICAgdmFyIG1vZGVsID0gbW9kZWxzW3R5cGVdO1xuICAgICAgcmV0dXJuIHZhbGlkYXRlLm1vZGVsKGNhbmRpZGF0ZSwgbW9kZWwsIG1vZGVscyk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gdmFsaWRhdGVEYXRhVHlwZTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBlcnJvclR5cGVzID0gcmVxdWlyZSgnLi9lcnJvclR5cGVzJyksXG4gIFZhbGlkYXRpb25FcnJvciA9IGVycm9yVHlwZXMuVmFsaWRhdGlvbkVycm9yLFxuICBWYWxpZGF0aW9uRXJyb3JzID0gZXJyb3JUeXBlcy5WYWxpZGF0aW9uRXJyb3JzLFxuICBNaXNzaW5nVmFsdWVFcnJvciA9IGVycm9yVHlwZXMuTWlzc2luZ1ZhbHVlRXJyb3IsXG4gIHZhbGlkYXRlID0gcmVxdWlyZSgnLi9pbmRleCcpO1xuXG4vLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEyMjEwMi93aGF0LWlzLXRoZS1tb3N0LWVmZmljaWVudC13YXktdG8tY2xvbmUtYW4tb2JqZWN0XG5mdW5jdGlvbiBjbG9uZShvYmope1xuICAgIGlmKG9iaiA9PT0gbnVsbCB8fCBvYmogPT09IHVuZGVmaW5lZCB8fCB0eXBlb2Ygb2JqICE9PSAnb2JqZWN0JykgcmV0dXJuIG9iajtcblxuICAgIGlmKEFycmF5LmlzQXJyYXkob2JqKSkgcmV0dXJuIG9iai5zbGljZSgpO1xuXG4gICAgdmFyIHRlbXAgPSB7fTtcblxuICAgIGZvcih2YXIga2V5IGluIG9iailcbiAgICAgICAgdGVtcFtrZXldID0gY2xvbmUob2JqW2tleV0pO1xuICAgIHJldHVybiB0ZW1wO1xufVxuXG5mdW5jdGlvbiBhZGRJbmhlcnRpZWRQcm9wZXJ0aWVzKG1vZGVsLCBtb2RlbElkLCBtb2RlbHMpe1xuICB2YXIgcGFyZW50O1xuXG4gIE9iamVjdC5rZXlzKG1vZGVscykuc29tZShmdW5jdGlvbihtb2RlbE5hbWUpe1xuICAgIHZhciBwb3RlbnRpYWxQYXJlbnQgPSBtb2RlbHNbbW9kZWxOYW1lXTtcbiAgICBpZiAoIXBvdGVudGlhbFBhcmVudC5zdWJUeXBlcykgcmV0dXJuO1xuXG4gICAgaWYocG90ZW50aWFsUGFyZW50LnN1YlR5cGVzLmluZGV4T2YobW9kZWxJZCkgIT09IC0xKXtcbiAgICAgIHBhcmVudCA9IHBvdGVudGlhbFBhcmVudDtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYoIXBhcmVudCkgcmV0dXJuO1xuXG4gIGZvcih2YXIgcHJvcGVydHlOYW1lIGluIHBhcmVudC5wcm9wZXJ0aWVzKXtcbiAgICBtb2RlbC5wcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV0gPSBwYXJlbnQucHJvcGVydGllc1twcm9wZXJ0eU5hbWVdO1xuICB9XG4gIFxuICBpZihwYXJlbnQucmVxdWlyZWQpIG1vZGVsLnJlcXVpcmVkID0gbW9kZWwucmVxdWlyZWQuY29uY2F0KHBhcmVudC5yZXF1aXJlZCk7XG5cbiAgYWRkSW5oZXJ0aWVkUHJvcGVydGllcyhtb2RlbCwgcGFyZW50LmlkLCBtb2RlbHMpO1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZU1vZGVsKGNhbmRpZGF0ZSwgbW9kZWwsIG1vZGVscyl7XG4gIGlmKGNhbmRpZGF0ZSA9PT0gbnVsbCB8fCB0eXBlb2YgY2FuZGlkYXRlICE9PSAnb2JqZWN0Jyl7XG4gICAgcmV0dXJuIG5ldyBWYWxpZGF0aW9uRXJyb3JzKGNhbmRpZGF0ZSwgbW9kZWwpO1xuICB9XG5cbiAgbW9kZWxzID0gbW9kZWxzIHx8IHt9O1xuXG4gIG1vZGVsID0gY2xvbmUobW9kZWwpO1xuICBpZighbW9kZWwucmVxdWlyZWQpIG1vZGVsLnJlcXVpcmVkID0gW107XG4gIGFkZEluaGVydGllZFByb3BlcnRpZXMobW9kZWwsIG1vZGVsLmlkLCBtb2RlbHMpO1xuXG4gIHZhciBlcnJvcnMgPSBbXTtcblxuICBtb2RlbC5yZXF1aXJlZC5mb3JFYWNoKGZ1bmN0aW9uKHByb3BlcnR5TmFtZSl7XG4gICAgaWYgKGNhbmRpZGF0ZVtwcm9wZXJ0eU5hbWVdICE9PSB1bmRlZmluZWQpIHJldHVybjtcblxuICAgIHZhciBwcm9wZXJ0eSA9IG1vZGVsLnByb3BlcnRpZXNbcHJvcGVydHlOYW1lXTtcbiAgICB2YXIgZXJyb3IgPSBuZXcgTWlzc2luZ1ZhbHVlRXJyb3IoKTtcbiAgICBlcnJvcnMucHVzaChuZXcgVmFsaWRhdGlvbkVycm9yKHByb3BlcnR5TmFtZSwgcHJvcGVydHksIGVycm9yKSk7XG4gIH0pO1xuXG4gIE9iamVjdC5rZXlzKGNhbmRpZGF0ZSkuZm9yRWFjaChmdW5jdGlvbihwcm9wZXJ0eU5hbWUpe1xuICAgIHZhciBwcm9wZXJ0eSA9IG1vZGVsLnByb3BlcnRpZXNbcHJvcGVydHlOYW1lXTtcbiAgICBcbiAgICBpZihwcm9wZXJ0eSA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG5cbiAgICB2YXIgZXJyb3IgPSB2YWxpZGF0ZS5kYXRhVHlwZShjYW5kaWRhdGVbcHJvcGVydHlOYW1lXSwgcHJvcGVydHksIG1vZGVscyk7XG4gICAgaWYoZXJyb3Ipe1xuICAgICAgZXJyb3JzLnB1c2gobmV3IFZhbGlkYXRpb25FcnJvcihwcm9wZXJ0eU5hbWUsIHByb3BlcnR5LCBlcnJvcikpO1xuICAgIH1cbiAgfSk7XG4gIFxuICBpZihlcnJvcnMubGVuZ3RoKXtcbiAgICByZXR1cm4gbmV3IFZhbGlkYXRpb25FcnJvcnMoY2FuZGlkYXRlLCBtb2RlbC5pZCwgbW9kZWwsIGVycm9ycyk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gdmFsaWRhdGVNb2RlbDsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBlcnJvclR5cGVzID0gcmVxdWlyZSgnLi9lcnJvclR5cGVzJyksXG4gIFZhbGlkYXRpb25FcnJvciA9IGVycm9yVHlwZXMuVmFsaWRhdGlvbkVycm9yLFxuICBWYWxpZGF0aW9uRXJyb3JzID0gZXJyb3JUeXBlcy5WYWxpZGF0aW9uRXJyb3JzLFxuICBNaXNzaW5nVmFsdWVFcnJvciA9IGVycm9yVHlwZXMuTWlzc2luZ1ZhbHVlRXJyb3IsXG4gIHZhbGlkYXRlID0gcmVxdWlyZSgnLi9pbmRleCcpO1xuXG5mdW5jdGlvbiB2YWxpZGF0ZU9wZXJhdGlvbihjYW5kaWRhdGUsIG9wZXJhdGlvbiwgbW9kZWxzKXtcbiAgdmFyIGVycm9ycyA9IFtdO1xuICBcbiAgdmFyIHByZXNlbnRQYXJhbXMgPSBvcGVyYXRpb24ucGFyYW1ldGVycy5maWx0ZXIoZnVuY3Rpb24ocGFyYW0pe1xuICAgIGlmIChjYW5kaWRhdGVbcGFyYW0ubmFtZV0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIHRydWU7XG4gICAgXG4gICAgaWYgKHBhcmFtLnJlcXVpcmVkKSB7XG4gICAgICB2YXIgZXJyb3IgPSBuZXcgTWlzc2luZ1ZhbHVlRXJyb3IoKTtcbiAgICAgIGVycm9ycy5wdXNoKG5ldyBWYWxpZGF0aW9uRXJyb3IocGFyYW0ubmFtZSwgcGFyYW0sIGVycm9yKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcblxuICBwcmVzZW50UGFyYW1zLmZvckVhY2goZnVuY3Rpb24ocGFyYW0pe1xuICAgIHZhciBlcnJvciA9IHZhbGlkYXRlLmRhdGFUeXBlKGNhbmRpZGF0ZVtwYXJhbS5uYW1lXSwgcGFyYW0sIG1vZGVscyk7XG4gICAgaWYoZXJyb3Ipe1xuICAgICAgZXJyb3JzLnB1c2gobmV3IFZhbGlkYXRpb25FcnJvcihwYXJhbS5uYW1lLCBwYXJhbSwgZXJyb3IpKTtcbiAgICB9XG4gIH0pO1xuICBcbiAgaWYoZXJyb3JzLmxlbmd0aCl7XG4gICAgcmV0dXJuIG5ldyBWYWxpZGF0aW9uRXJyb3JzKGNhbmRpZGF0ZSwgb3BlcmF0aW9uLm5pY2tuYW1lLCBvcGVyYXRpb24sIGVycm9ycyk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gdmFsaWRhdGVPcGVyYXRpb247IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZXJyb3JUeXBlcyA9IHJlcXVpcmUoJy4vZXJyb3JUeXBlcycpO1xuXG5mdW5jdGlvbiB2YWxpZGF0ZUludGVnZXIoY2FuZGlkYXRlLCBkYXRhVHlwZSl7XG4gIHZhciBlcnJvciA9IHZhbGlkYXRlTnVtYmVyKGNhbmRpZGF0ZSwgZGF0YVR5cGUpO1xuICBpZihlcnJvcikgcmV0dXJuIGVycm9yO1xuXG4gIGlmKGNhbmRpZGF0ZSAlIDEpe1xuICAgIHJldHVybiBuZXcgZXJyb3JUeXBlcy5Ob3RBbkludGVnZXJFcnJvcihjYW5kaWRhdGUpO1xuICB9XG59XG5leHBvcnRzLnZhbGlkYXRlSW50ZWdlciA9IHZhbGlkYXRlSW50ZWdlcjtcblxuZnVuY3Rpb24gdmFsaWRhdGVOdW1iZXIoY2FuZGlkYXRlLCBkYXRhVHlwZSl7XG4gIGlmKCEodHlwZW9mIGNhbmRpZGF0ZSA9PT0gJ251bWJlcicgfHwgY2FuZGlkYXRlIGluc3RhbmNlb2YgTnVtYmVyKSB8fCBpc05hTihjYW5kaWRhdGUpKXtcbiAgICByZXR1cm4gbmV3IGVycm9yVHlwZXMuTm90QU51bWJlckVycm9yKGNhbmRpZGF0ZSwgdHlwZW9mIGNhbmRpZGF0ZSk7XG4gIH1cbiAgXG4gIGlmKChkYXRhVHlwZS5taW5pbXVtICE9PSB1bmRlZmluZWQpICYmIGNhbmRpZGF0ZSA8IHBhcnNlSW50KGRhdGFUeXBlLm1pbmltdW0sIDEwKSl7XG4gICAgcmV0dXJuIG5ldyBlcnJvclR5cGVzLk51bWJlclRvb1NtYWxsRXJyb3IoY2FuZGlkYXRlLCBkYXRhVHlwZS5taW5pbXVtKTtcbiAgfVxuICBcbiAgaWYoKGRhdGFUeXBlLm1heGltdW0gIT09IHVuZGVmaW5lZCkgJiYgY2FuZGlkYXRlID4gcGFyc2VJbnQoZGF0YVR5cGUubWF4aW11bSwgMTApKXtcbiAgICByZXR1cm4gbmV3IGVycm9yVHlwZXMuTnVtYmVyVG9vTGFyZ2VFcnJvcihjYW5kaWRhdGUsIGRhdGFUeXBlLm1heGltdW0pO1xuICB9XG59XG5leHBvcnRzLnZhbGlkYXRlTnVtYmVyID0gdmFsaWRhdGVOdW1iZXI7XG5cbmZ1bmN0aW9uIHZhbGlkYXRlQm9vbGVhbihjYW5kaWRhdGUpe1xuICBpZighKHR5cGVvZiBjYW5kaWRhdGUgPT09ICdib29sZWFuJyB8fCBjYW5kaWRhdGUgaW5zdGFuY2VvZiBCb29sZWFuKSl7XG4gICAgcmV0dXJuIG5ldyBlcnJvclR5cGVzLk5vdEFCb29sZWFuRXJyb3IoY2FuZGlkYXRlLCB0eXBlb2YgY2FuZGlkYXRlKTtcbiAgfVxufVxuZXhwb3J0cy52YWxpZGF0ZUJvb2xlYW4gPSB2YWxpZGF0ZUJvb2xlYW47XG5cblxuZnVuY3Rpb24gdmFsaWRhdGVWb2lkKGNhbmRpZGF0ZSl7XG4gIGlmKGNhbmRpZGF0ZSAhPSBudWxsKXtcbiAgICByZXR1cm4gbmV3IGVycm9yVHlwZXMuTm90Vm9pZEVycm9yKGNhbmRpZGF0ZSwgdHlwZW9mIGNhbmRpZGF0ZSk7XG4gIH1cbn1cbmV4cG9ydHMudmFsaWRhdGVWb2lkID0gdmFsaWRhdGVWb2lkO1xuXG5mdW5jdGlvbiB2YWxpZGF0ZUZpbGUoKXtcbiAgLy8gTm90IHN1cmUgaG93IHRvIGNoZWNrIHRoaXMsIHNpbmNlIGFueXRoaW5nIGNvdWxkIHF1YWxpZnkgYXMgJ0ZpbGUnLlxufVxuZXhwb3J0cy52YWxpZGF0ZUZpbGUgPSB2YWxpZGF0ZUZpbGU7XG5cbmZ1bmN0aW9uIHZhbGlkYXRlU3RyaW5nKGNhbmRpZGF0ZSwgZGF0YVR5cGUpe1xuICBpZih0eXBlb2YgY2FuZGlkYXRlICE9PSAnc3RyaW5nJyAmJiAhKGNhbmRpZGF0ZSBpbnN0YW5jZW9mIFN0cmluZykpe1xuICAgIHJldHVybiBuZXcgZXJyb3JUeXBlcy5Ob3RBU3RyaW5nRXJyb3IoY2FuZGlkYXRlLCB0eXBlb2YgY2FuZGlkYXRlKTtcbiAgfVxuXG4gIGlmKCdlbnVtJyBpbiBkYXRhVHlwZSl7XG4gICAgaWYoZGF0YVR5cGUuZW51bS5pbmRleE9mKGNhbmRpZGF0ZSkgPT09IC0xKSB7XG4gICAgICByZXR1cm4gbmV3IGVycm9yVHlwZXMuU3RyaW5nTm90SW5FbnVtRXJyb3IoY2FuZGlkYXRlLCBkYXRhVHlwZS5lbnVtKTtcbiAgICB9XG4gIH1cbn1cbmV4cG9ydHMudmFsaWRhdGVTdHJpbmcgPSB2YWxpZGF0ZVN0cmluZzsiXX0=
(2)
});
