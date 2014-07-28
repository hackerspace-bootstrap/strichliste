var sqlite3 = require('sqlite3');

var Sqlite = require('./Sqlite');

var TYPE_SQLITE = 'SQLITE';

var Factory = {
    create: function(configuration, callback) {
        if (configuration.type === TYPE_SQLITE) {
            var db = new sqlite3.Database(configuration.options.filename, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, function(error) {
                if (error) return callback(error);

                callback(null, new Sqlite(db));
            });
        } else {
            callback(new Error('type not supported'));
        }
    }
};

module.exports = Factory;