var mysql = require('mysql');

var pool;

module.exports = {
    // Put any extensions to the context here. For example, database pooling would be a good extension.

    init: function(stage, stageVars) {
      
        pool = mysql.createPool(stageVars.mysql.connection);

      

        var ddl = "CREATE TABLE IF NOT EXISTS MODEL1 ( " +
					"id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, " +
					"integercode INT(6)  NOT NULL, " +
					"description VARCHAR(30), " +
					"displayName VARCHAR(30))";

	

        pool.query(ddl, function(err, rows, fields) {
            if (err) throw err;
        });

    },

    getPool: function() {
        return pool;
    }



}
