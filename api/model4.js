module.exports = {
    list: function(event, context) {
        console.log('model4.list', event);
        context.succeed([{resource: 'model4', value1: event.params.value1 }]);
    },
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

