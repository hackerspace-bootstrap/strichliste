var hoek = require('hoek');
var seq = require('seq');
var squel = require('squel');

function UserPersistence (database) {
    this._db = database;
}

UserPersistence.prototype.loadUsers = function (limitStatement, orderStatement, callback) {
    this._db.selectMany(this._createUserQuery(limitStatement).toString(), [], callback);
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
    var query = this._createTransactionQuery(limitStatement)
        .where('userId = ?', userId);

    var parametrized = query.toParam();

    this._db.selectMany(parametrized.text, parametrized.values, callback);
};

UserPersistence.prototype.loadMetrics = function (callback) {
    var that = this;
    var result = {};

    seq()
        .seq(this._createMetricSubStep('select count(*) as countTransactions from transactions', result))
        .seq(this._createMetricSubStep('select sum(value) as overallBalance from transactions', result))
        .seq(this._createMetricSubStep('select count(*) as countUsers from users', result))
        .seq(this._createMetricSubStep('select avg(userBalance) as avgBalance from (select sum(value) as userBalance from transactions group by userId) as ghoti', result))
        .seq(function () {
            var done = this;
            that._db.selectMany('select date(createDate) as date, count(*) as overallNumber,count(distinct userid) as distinctUsers,sum(value) as dayBalance,sum(max(value, 0)) as dayBalancePositive,sum(min(value, 0)) as dayBalanceNegative from transactions where createDate >=  date("now", "-30 day") group by date(createDate);', [], function (error, transactions) {
                if (error) return done(error);

                result.days = transactions;
                done();
            });
        })
        .seq(function () {
            callback(null, result);
        })
        .catch(function (error) {
            callback(error, null);
        });
};

UserPersistence.prototype._createMetricSubStep = function (query, overallResult) {
    var that = this;

    return function () {
        var done = this;
        that._db.selectOne(query, [], function (error, result) {
            if (error) return done(error);

            hoek.merge(overallResult, result);
            done();
        });
    };
};

UserPersistence.prototype._createTransactionQuery = function (limitStatement) {
    var query = squel.select()
        .field('id')
        .field('userId')
        .field('createDate')
        .field('value')
        .from('transactions')
        .order('id', false);

    if (limitStatement) {
        query.offset(limitStatement.offset());
        query.limit(limitStatement.limit());
    }

    return query;
};

UserPersistence.prototype._createUserQuery = function (limitStatement) {
    var query = squel.select()
        .field('users.id', 'id')
        .field('users.name', 'name')
        .field('coalesce(sum(value),0)', 'balance')
        .field('max(transactions.createDate)', 'lastTransaction')
        .from('users')
        .left_join("transactions", null, "transactions.userId = users.id")
        .group('users.id');

    if (limitStatement) {
        query.offset(limitStatement.offset());
        query.limit(limitStatement.limit());
    }

    return query;
};

module.exports = UserPersistence;