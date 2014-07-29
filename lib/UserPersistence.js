var squel = require('squel');

function UserPersistence(database) {
    this._db = database;
}

UserPersistence.prototype.loadUsers = function(callback) {
    var query = this._createUserQuery();

    this._db.selectMany(query.toString(), [], callback);
};

UserPersistence.prototype.loadUserById = function(userId, callback) {
    var query = this._createUserQuery()
            .where('users.id = ?');

    this._db.selectOne(query.toString(), [userId], callback);
};

UserPersistence.prototype.loadUserByName = function(name, callback) {
    var query = this._createUserQuery()
        .where('users.name = ?');

    this._db.selectOne(query.toString(), [name.toLowerCase()], callback);
};

UserPersistence.prototype.createUser = function(name, callback) {
    var query = squel.insert()
            .into('users')
            .set('name', name)
            .set('createDate', 'now');

    this._db.query(query.toString(), [], function(error) {
        if (error) return callback(error);

        callback(null, this.lastId);
    });
};

UserPersistence.prototype.createTransaction = function(userId, amount, callback) {
    var query = squel.insert()
            .into('transactions')
            .set('userId', userId)
            .set('createDate', 'now')
            .set('value', amount);

    this._db.query(query.toString(), [], function(error) {
        if (error) return callback(error);

        callback(null, this.lastId);
    });
};

UserPersistence.prototype.loadTransaction = function(transactionId, callback) {
    var query = squel.select()
            .field('id')
            .field('userId')
            .field('createDate')
            .field('value')
            .from('transactions')
            .where('id = ?');

    this._db.selectOne(query.toString(), [transactionId], callback);
};

UserPersistence.prototype._createUserQuery = function() {
    return squel.select()
        .field('users.id', 'id')
        .field('users.name', 'name')
        .field('coalesce(sum(value),0)', 'balance')
        .from('users')
        .left_join("transactions", null, "transactions.userId = users.id")
        .group('users.id');
};

module.exports = UserPersistence;