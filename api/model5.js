module.exports = {
    list: function(event, context) {
        console.log('model5.list', event);
        context.succeed([{
            resource: 'model5',
            value1: event.params.value1
        }]);
    },
    post: function(event, context) {
        console.log('model5.post', event);
        context.succeed([{
            resource: 'model5',
            id: event.params.id,
            value1: event.params.value1,
            value2: event.params.value2,
            value3: event.params.value3
        }]);
    },
    validate: function(method, event) {
        console.log('model5 validationErrors', event.validationErrors);
        if (false) {
            event.validationErrors.push({
                type: 'CUSTOM_ERRROR',
                message: 'This is some custom error, fieldname == 99999',
                fieldname: 'fieldname'
            });
        }
    }
}
