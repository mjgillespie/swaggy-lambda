module.exports = {
    list: function(event, context) {
       // console.log('model1.list', event);
        context.succeed([{
            "id": "abc123",
            "integercode": 1,
            "description": "Sample 1",
            "displayName": "SMP-1"
        }, {
            "id": "jsek2sk4",
            "integercode": 2,
            "description": "Sample 2",
            "displayName": "SMP-2"
        }, {
            "id": "1kd84mxp",
            "integercode": 3,
            "description": "Sample 3",
            "displayName": "SMP-3"
        }, {
            "id": "h83mem",
            "integercode": 4,
            "description": "Sample 4",
            "displayName": "SMP-4"
        }]);
    },
    get: function(event, context) {
       // console.log('model1.get', event);
        if (event.params.modelId == 'notfound') {
            context.fail('notfound');
        } else {
            context.succeed({
                "id": event.params.modelId,
                "integercode": 1,
                "description": "Sample 1",
                "displayName": "SMP-1"
            });
        }
    },
    put: function(event, context) {
       // console.log('model1.put', event);
        context.succeed(event.body);
    },
    post: function(event, context) {
     //   console.log('model1.post', event);
        context.succeed(event.body);
    },
    log: function(message) {

    }
}
