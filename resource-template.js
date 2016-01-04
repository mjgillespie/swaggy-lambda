module.exports = {
    {{#if methods.list}}
    list: function(event, context) {
        console.log('{{resourceName}}.list', event);
        context.succeed({resource: '{{resourceName}}' });
    },
    {{/if}}
    {{#if methods.get}}
    get: function(event, context) {
        console.log('{{resourceName}}.get', event);
    
        if (event.params.id == 'notfound') { // If the entity cannot be found, return a 'notfound' error.
            context.fail('notfound');
        } else {
             context.succeed({resource: '{{resourceName}}' });
        } 
    },
    {{/if}}
    {{#if methods.post}}
    post: function(event, context) {
        console.log('{{resourceName}}.post', event);
        context.succeed(event.body);
    },   
    {{/if}}
    {{#if methods.put}}
    put: function(event, context) {
        console.log('{{resourceName}}.put', event);
        context.succeed(event.body);
    },
    {{/if}}   
    {{#if methods.delete}}
    delete: function(event, context) {
        console.log('{{resourceName}}.delete', event);
        context.succeed();
    },
    {{/if}}
     validate: function(method, event) {
        if (false) {
            event.validationErrors.push({
                type: 'CUSTOM_ERRROR',
                message: 'This is some custom error, fieldname == 99999',
                fieldname: 'fieldname'
            });
        }
    }
}

