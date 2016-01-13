module.exports = {
    {{#if methods.list}}
    list: function(event, context) {
        console.log('{{resourceName}}.list', event);

        var sqlFilter = ""; // Create the where clause from the supplied parameters
        var querySql = "SELECT * from {{toUpperCase resourceName}} " + sqlFilter;
        var countSql = "SELECT COUNT(*) from {{toUpperCase resourceName}} " + sqlFilter;



        context.extensions.getPool().query(querySql, function(err, rows, fields) {


            context.extensions.getPool().query(countSql, function(errCount, rowsCount, fieldsCount) {

                if (err) {
                    console.log(err);
                    context.fail(err.code);
                } else {

                    context.succeed({
                        totalCount: rowsCount[0].totalCount,
                        start: event.params.start ? event.params.start : 0,
                        count: rows.length,
                        data: rows
                    });
                }

            });

        });
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

