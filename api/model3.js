module.exports = {
    list: function(event, context) {
      //  console.log('model3.list', event);
        context.succeed([{
            "id": "abc123",
            "value": "ready"
        }, {
            "id": "abc123",
            "value": "not ready"
        }]);
    },
    get: function(event, context) {
      //  console.log('model3.get', event);
        context.succeed({
            "id": event.params.id,
            "value": "ready"
        });
    },
    put: function(event, context) {
     //   console.log('model3.put', event);
        context.succeed(event.body);
    },
    post: function(event, context) {
    //    console.log('model3.post', event);
        context.succeed(event.body);
    },
    log: function(message) {

    }
}
