'use strict';

/* jshint -W053 */

var validateArray = require('./validateArray'),
  errorTypes = require('./errorTypes');

describe('array validator', function(){
  it('exists', function(){
    expect(validateArray).toBeDefined();
  });

  it('doesn\'t throw errors for valid values', function(){
    function test(value, dataType){
      var result = validateArray(value, dataType);
      expect(result).toBeUndefined();
    }

    var stringArrayDataType = { 
      items: {
        type: 'string'
      }
    };

    test([], stringArrayDataType);
    test([1, 2, 3], { 
      items: {
        type: 'number'
      },
      uniqueItems: true
    });
    test(['1', '2', '3'], stringArrayDataType);
  });

  it('throws errors for invalid values', function(){
    function test(value, dataType, errorType){
      var result = validateArray(value, dataType);
      expect(result instanceof errorType).toBe(true);
    }

    var stringArrayDataType = { 
      items: {
        type: 'string'
      }
    };

    test('not an array', stringArrayDataType, errorTypes.NotAnArrayError);
    test(123, stringArrayDataType, errorTypes.NotAnArrayError);
    test(new String('not an array'), stringArrayDataType, errorTypes.NotAnArrayError);
    test({}, stringArrayDataType, errorTypes.NotAnArrayError);
    test(undefined, stringArrayDataType, errorTypes.NotAnArrayError);
    test([1, 2, 3], stringArrayDataType, errorTypes.ErrorsInArrayElementsError);
    test([1, 2, 1], {
      uniqueItems: true,
      items: {
        type: 'string'
      }
    }, errorTypes.DuplicateInSetError);
  });
});