'use strict';

/* jshint -W053 */

var validateOperation = require('./validateOperation'),
  errorTypes = require('./errorTypes');

describe('operation validator', function(){
  var models,
    operations;

  function hasValidationErrors(obj, operation, models){
    var result = validateOperation(obj, operation, models);
    return result instanceof errorTypes.ValidationErrors;
  }

  beforeEach(function(){
    operations = {
      create: {
        method: 'PUT',
        nickname: 'create',
        parameters: [
          {
            paramType: 'path',
            required: true,
            name: 'name',
            type: 'string'
          },
          {
            paramType: 'form',
            name: 'age',
            type: 'number',
            maximum: '100',
            minimum: '1'
          },
          {
            paramType: 'form',
            name: 'captain',
            type: 'Captain'
          }
        ]
      }
    };

    models = {
      Captain: {
        id: 'Captain',
        required: ['names'],
        properties: {
          names: { 
            type: 'array',
            uniqueItems: true,
            items: {
              type: 'string'
            }
          },
          hat: {
            $ref: 'Hat'
          },
          ships: {
            type: 'array',
            items: {
              $ref: 'Ship'
            }
          }
        }
      },
      Hat: {
        id: 'Hat',
        properties: {
          color: { type: 'string' }
        }
      },
      Ship: {
        id: 'Ship',
        required: ['crewCount'],
        properties: {
          crewCount: {
            type: 'integer',
            minimum: '1',
            maximum: '10'
          },
          firstMate: { $ref: 'Person' }
        }
      },
      Person: {
        id: 'Person',
        required: ['name', 'type'],
        properties: {
          type: { type: 'string' },
          name: { type: 'string' },
          age: { type: 'number' }
        },
        subTypes: ['Captain'],
        discriminator: 'type'
      },
      Cat: {
        id: 'Cat',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      }
    };
  });

  it('exists', function(){
    expect(validateOperation).toBeDefined();
  });

  it('can handle operations with primitive parameters', function(){
    expect(
      hasValidationErrors(
        {
          name: 'Joe'
        },
        operations.create,
        models
      )
    ).toBe(false);

    expect(
      hasValidationErrors(
        {
          name: 'Joe',
          age: 42
        },
        operations.create,
        models
      )
    ).toBe(false);

    expect(
      hasValidationErrors(
        {
          name: 'Joe',
          age: -42
        },
        operations.create,
        models
      )
    ).toBe(true);

    expect(
      hasValidationErrors(
        {
          age: 42
        },
        operations.create,
        models
      )
    ).toBe(true);    
  });


  it('can handle operations with complex parameters', function(){
    expect(
      hasValidationErrors(
        {
          name: 'Jimmy',
          captain: {
            names: ['Bob', 'Dole'],
            name: 'Bobby',
            type: 'Captain',
            hat: {
              color: 'blue'
            },
            ships: [{
              crewCount: 5
            }]
          }
        },
        operations.create,
        models
      )
    ).toBe(false);

    expect(
      hasValidationErrors(
        {
          name: 'Jimmy',
          captain: {
            names: ['Bob', 'Dole'],
            name: 'Bobby',
            type: 'Captain',
            hat: {
              color: 'blue'
            },
            ships: [{
              crewCount: 0
            }]
          }
        },
        operations.create,
        models
      )
    ).toBe(true); // crewCount below min    
  });
});