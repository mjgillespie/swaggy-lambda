var helper = {
    get: function(event, context) {
        context.extensions.getPool().query('SELECT id, integercode, description, displayName from MODEL1 WHERE ID = ?', [event.params.modelId], function(err, rows, fields) {

            if (err) {
                console.log(err);
                context.fail(err.code);
            }
            if (rows.length === 0) {
                context.fail("notfound");
            } else {

                context.succeed(rows[0]);
            }


        });
    }
}


module.exports = {
    list: function(event, context) {
        context.extensions.getPool().query('SELECT id, integercode, description, displayName from MODEL1', function(err, rows, fields) {


            context.extensions.getPool().query('SELECT COUNT(*) as totalCount from MODEL1', function(errCount, rowsCount, fieldsCount) {

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
    get: function(event, context) {
        helper.get(event, context);
    },
    put: function(event, context) {

        var sql = 'UPDATE MODEL1 SET integercode=?, description=?, displayName=? WHERE ID = ?';
        var queryParams = [event.body.integercode, event.body.description, event.body.displayName, event.params.modelId];

        context.extensions.getPool().query(sql, queryParams, function(err, rows, fields) {

            if (err) {
                console.log('Error in update', fields);
                console.log(err);
                context.fail(err.code);
            } else {
                helper.get(event, context);
            }


        });
    },
    post: function(event, context) {
        var sql = 'INSERT INTO MODEL1 (integercode, description, displayName) VALUES (?, ?, ?)';
        var queryParams = [event.body.integercode, event.body.description, event.body.displayName];

        context.extensions.getPool().query(sql, queryParams, function(err, rows, fields) {

            if (err) {
                console.log('Error in insert', fields);
                console.log(err);
                context.fail(err.code);
            } else {
                event.params.modelId = rows.insertId;
                helper.get(event, context);
            }


        });
    },
    delete: function(event, context) {
        var sql = 'DELETE FROM MODEL1 WHERE ID = ?';
        var queryParams = [event.params.modelId];

        context.extensions.getPool().query(sql, queryParams, function(err, rows, fields) {

        
            if (err) {
                console.log('Error in delete', fields);
                console.log(err);
                context.fail(err.code);
            }
            else if (rows.affectedRows === 0) {
                context.fail('notfound');
            } else {
                context.succeed({});
            }


        });
    },
    log: function(message) {

    }
}
