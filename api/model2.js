module.exports = {
    list: function(event, context) {
      //  console.log('workflows.list', event);
        context.succeed([{
            "id": "abc123",
            "type": "type1",
            "state": "initial",
            "status": "ready",
            "lastUpdated": "01-01-2015 11:43 AM",
            "dateCreated": "01-01-2015 11:43 AM"
        }, {
            "id": "jsek2sk4",
            "type": "type1",
            "state": "initial",
            "status": "ready",
            "lastUpdated": "01-01-2015 11:43 AM",
            "dateCreated": "01-01-2015 11:43 AM"
        }, {
            "id": "1kd84mxp",
            "type": "type1",
            "state": "initial",
            "status": "ready",
            "lastUpdated": "01-01-2015 11:43 AM",
            "dateCreated": "01-01-2015 11:43 AM"
        }, {
            "id": "h83mem",
            "type": "type1",
            "state": "initial",
            "status": "ready",
            "lastUpdated": "01-01-2015 11:43 AM",
            "dateCreated": "01-01-2015 11:43 AM"
        }]);
    },
    get: function(event, context) {
    //    console.log('workflows.get', event);
        context.succeed({
            "id": event.params.id,
            "type": "type1",
            "state": "initial",
            "status": "ready",
            "lastUpdated": "01-01-2015 11:43 AM",
            "dateCreated": "01-01-2015 11:43 AM"
        });
    },
    put: function(event, context) {
    //    console.log('workflows.put', event);
        context.succeed(event.body);
    },
    post: function(event, context) {
    //    console.log('workflows.post', event);
        context.succeed(event.body);
    },
    log: function(message) {

    }
}
