'use strict';

/* jshint -W053 */

var validateModel = require('./validateModel'),
  errorTypes = require('./errorTypes');

describe('model validator', function(){
  var models;

  function hasValidationErrors(obj, model, models){
    var result = validateModel(obj, model, models);
    return result instanceof errorTypes.ValidationErrors;
  }

  beforeEach(function(){
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
            minimum: 1,
            maximum: 10
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
    expect(validateModel).toBeDefined();
  });

  it('can handle models with primitive properties', function(){
    expect(hasValidationErrors({ name: 'Bob Dole', age: 42}, models.Cat)).toBe(false);

    expect(hasValidationErrors({ name: 'Bob Dole' }, models.Cat)).toBe(false);

    expect(hasValidationErrors({}, models.Cat)).toBe(true);

    expect(hasValidationErrors(null, models.Cat)).toBe(true);
  });

  it('can validate array properties', function(){
    expect(
      hasValidationErrors(
        {
          names: ['Bobby', 'Doug'],
          name: 'Bobby',
          type: 'Captain',
        }, 
        models.Captain, 
        models
      )
    ).toBe(false);

    expect(
      hasValidationErrors(
        {
          names: ['Bob', 123]
        }, 
        models.Captain, 
        models
      )
    ).toBe(true);
  });

  it('can validate embedded models', function(){
    expect(
      hasValidationErrors(
        {
          names: ['Bob', 'Dole'],
          name: 'Bobby',
          type: 'Captain',
          hat: {
            color: 'blue'
          },
          ships: []
        }, 
        models.Captain, 
        models
      )
    ).toBe(false);

    expect(
      hasValidationErrors(
        {
          names: ['Bob', 'Dole'],
          name: 'Bobby',
          type: 'Captain',
          hat: {
            color: 'blue'
          },
          ships: [{
            crewCount: 5
          }]
        }, 
        models.Captain, 
        models
      )
    ).toBe(false);

    expect(
      hasValidationErrors(
        {
          names: ['Bob', 'Dole'],
          name: 'Bobby',
          type: 'Captain',
          hat: {
            color: 'blue'
          },
          ships: [{
            crewCount: 5,
            firstMate: {
              name: 'Jimmy',
              type: 'Person',
              age: 20
            }
          }]
        }, 
        models.Captain, 
        models
      )
    ).toBe(false);

    expect(
      hasValidationErrors(
        {
          names: ['Bob', 'Dole'],
          name: 'Bobby',
          type: 'Captain',
          hat: {
            color: 'blue'
          },
          ships: [{
            crewCount: 0,
            firstMate: {
              name: 'Jimmy',
              type: 'Person',
              age: 20
            }
          }]
        },
        models.Captain,
        models
      )
    ).toBe(true); // crew count too low
  });

  it('can validate inherited models', function(){
    expect(
      hasValidationErrors(
        {
          names: ['Bob', 'Dole'],
          name: 'Bobby',
          type: 'Captain',
          hat: {
            color: 'blue'
          },
          ships: [{
            crewCount: 0,
            firstMate: {
              name: 'Jimmy',
              type: 'Person',
              age: 20
            }
          }]
        },
        models.Captain,
        models
      )
    ).toBe(true); // missing discriminiator
  });
});