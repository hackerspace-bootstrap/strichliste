var ce = require('cloneextend');
var seq = require('seq');
var squel = require('squel');

function UserPersistence (database) {
    this._db = database;
}

UserPersistence.prototype.loadUsers = function (limitStatement, orderStatement, callback) {
    var query = this._createUserQuery();

    if (limitStatement !== null) {
        query.offset(limitStatement.offset());
        query.limit(limitStatement.limit());
    }

    this._db.selectMany(query.toString(), [], callback);
};

UserPersistence.prototype.loadUserById = function (userId, callback) {
    var query = this._createUserQuery()
        .where('users.id = ?', userId);

    var parametrized = query.toParam();

    this._db.selectOne(parametrized.text, parametrized.values, callback);
};

UserPersistence.prototype.loadUserByName = function (name, callback) {
    var query = this._createUserQuery()
        .where('lower(users.name) = ?', name.toLowerCase());

    var parametrized = query.toParam();

    this._db.selectOne(parametrized.text, parametrized.values, callback);
};

UserPersistence.prototype.createUser = function (name, callback) {
    var query = squel.insert()
        .into('users')
        .set('name', name);

    var parametrized = query.toParam();

    this._db.query(parametrized.text, parametrized.values, function (error, result) {
        if (error) return callback(error, null);

        callback(null, result.lastID);
    });
};

UserPersistence.prototype.createTransaction = function (userId, amount, callback) {
    var query = squel.insert()
        .into('transactions')
        .set('userId', userId)
        .set('value', amount);

    var parametrized = query.toParam();

    this._db.query(parametrized.text, parametrized.values, function (error, result) {
        if (error) return callback(error, null);

        callback(null, result.lastID);
    });
};

UserPersistence.prototype.loadTransaction = function (transactionId, callback) {
    var query = this._createTransactionQuery()
        .where('id = ?', transactionId);

    var parametrized = query.toParam();

    this._db.selectOne(parametrized.text, parametrized.values, callback);
};

UserPersistence.prototype.loadTransactionsByUserId = function (userId, limitStatement, orderStatement, callback) {
    var query = this._createTransactionQuery()
        .where('userId = ?', userId);

    if (limitStatement !== null) {
        query.offset(limitStatement.offset());
        query.limit(limitStatement.limit());
    }

    var parametrized = query.toParam();

    this._db.selectMany(parametrized.text, parametrized.values, callback);
};

UserPersistence.prototype.loadMetrics = function(callback) {
    var result = {};

    seq()
        .par(this._createMetricSubStep('select count(*) as countTransactions from transactions', result))
        .par(this._createMetricSubStep('select sum(value) as overallBalance from transactions', result))
        .par(this._createMetricSubStep('select count(*) as countUsers from users', result))
        .par(this._createMetricSubStep('select avg(userBalance) as avgBalance from (select sum(value) as userBalance from transactions group by userId) as ghoti', result))
        .seq(function() {
            callback(null, result);
        })
        .catch(callback);
};

UserPersistence.prototype._createMetricSubStep = function(query, overallResult) {
    var that = this;

    return function() {
        var done = this;
        that._db.selectOne(query, [], function(error, result) {
            if (error) return done(error);

            ce.extend(overallResult, result);
            done();
        });
    };
};

UserPersistence.prototype._createTransactionQuery = function () {
    return squel.select()
        .field('id')
        .field('userId')
        .field('createDate')
        .field('value')
        .from('transactions')
        .order('id', false);
};

UserPersistence.prototype._createUserQuery = function () {
    return squel.select()
        .field('users.id', 'id')
        .field('users.name', 'name')
        .field('coalesce(sum(value),0)', 'balance')
        .field('max(transactions.createDate)', 'lastTransaction')
        .from('users')
        .left_join("transactions", null, "transactions.userId = users.id")
        .group('users.id');
};

module.exports = UserPersistence;