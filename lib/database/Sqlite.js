var sqlite3 = require('sqlite3');

function Database (db) {
    this._db = db;
}

Database.prototype.selectOne = function (query, parameters, callback) {
    this._db.get(query, parameters, callback);
};

Database.prototype.selectMany = function (query, parameters, callback) {
    this._db.all(query, parameters, callback);
};

Database.prototype.query = function (query, parameters, callback) {
    this._db.run(query, parameters, function(error) {
        if (error) return callback(error);

        callback(null, this);
    });
};

module.exports = Database;