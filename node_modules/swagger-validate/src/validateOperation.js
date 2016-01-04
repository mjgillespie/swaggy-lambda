'use strict';

var errorTypes = require('./errorTypes'),
  ValidationError = errorTypes.ValidationError,
  ValidationErrors = errorTypes.ValidationErrors,
  MissingValueError = errorTypes.MissingValueError,
  validate = require('./index');

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