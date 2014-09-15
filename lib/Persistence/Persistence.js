function Persistence (db) {
    this._db = db;
}

Persistence.SELECT_ONE = 'One';
Persistence.SELECT_MANY = 'Many';

Persistence.prototype._insert = function(query, callback) {
    var parametrized = query.toParam();

    this._db.query(parametrized.text, parametrized.values, function (error, result) {
        if (error) return callback(error, null);

        callback(null, result.lastID);
    });
};

Persistence.prototype._queryOne = function(query, callback) {
    this._query(Persistence.SELECT_ONE, query, callback);
};

Persistence.prototype._queryMany = function(query, callback) {
    this._query(Persistence.SELECT_MANY, query, callback);
};

Persistence.prototype._query = function (type, query, callback) {
    var parametrized = query.toParam();

    this._db['select' + type].call(this._db, parametrized.text, parametrized.values, callback);
};

module.exports = Persistence;