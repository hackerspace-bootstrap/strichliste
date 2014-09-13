var hoek = require('hoek');
var seq = require('seq');
var squel = require('squel');

function Persistence (db) {
    this._db = db;
}

Persistence.SELECT_ONE = 'One';
Persistence.SELECT_MANY = 'Many';

Persistence.prototype.loadUsers = function (limitStatement, orderStatement, callback) {
    this._queryMany(this._createUserQuery(limitStatement), callback);
};

Persistence.prototype.loadUserById = function (userId, callback) {
    this._queryOne(this._createUserQuery().where('users.id = ?', userId), callback);
};

Persistence.prototype.loadUserByName = function (name, callback) {
    this._queryOne(this._createUserQuery().where('lower(users.name) = ?', name.toLowerCase()), callback);
};

Persistence.prototype.createUser = function (name, callback) {
    var query = squel.insert()
        .into('users')
        .set('name', name);

    this._insert(query, callback);
};

Persistence.prototype.createTransaction = function (userId, amount, callback) {
    var query = squel.insert()
        .into('transactions')
        .set('userId', userId)
        .set('value', amount);

    this._insert(query, callback);
};

Persistence.prototype.loadTransactions = function(limitStatement, orderStatement, callback) {
    this._queryMany(this._createTransactionQuery(limitStatement), callback);
};

Persistence.prototype.loadTransaction = function (transactionId, callback) {
    this._queryOne(this._createTransactionQuery().where('id = ?', transactionId), callback);
};

Persistence.prototype.loadTransactionsByUserId = function (userId, limitStatement, orderStatement, callback) {
    this._queryMany(this._createTransactionQuery(limitStatement).where('userId = ?', userId), callback);
};


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

Persistence.prototype.loadMetrics = function (callback) {
    var that = this;
    var result = {};

    seq()
        .par(this._createMetricSubStep('select count(*) as countTransactions from transactions', result))
        .par(this._createMetricSubStep('select sum(value) as overallBalance from transactions', result))
        .par(this._createMetricSubStep('select count(*) as countUsers from users', result))
        .par(this._createMetricSubStep('select avg(userBalance) as avgBalance from (select sum(value) as userBalance from transactions group by userId) as ghoti', result))
        .par(function () {
            var done = this;
            that._db.selectMany('select date(createDate) as date, count(*) as overallNumber,count(distinct userid) as distinctUsers,sum(value) as dayBalance,sum(max(value, 0)) as dayBalancePositive,sum(min(value, 0)) as dayBalanceNegative from transactions where createDate >=  date("now", "-30 day") group by date(createDate);', [], function (error, transactions) {
                if (error) return done(error);

                result.days = transactions;
                done();
            });
        })
        .seq(callback.bind(null, null, result))
        .catch(function (error) {
            callback(error, null);
        });
};

Persistence.prototype._createMetricSubStep = function (query, overallResult) {
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

Persistence.prototype._createTransactionQuery = function (limitStatement) {
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

Persistence.prototype._createUserQuery = function (limitStatement) {
    var query = squel.select()
        .field('users.id', 'id')
        .field('users.name', 'name')
        .field('coalesce(sum(value),0)', 'balance')
        .field('max(transactions.createDate)', 'lastTransaction')
        .from('users')
        .left_join('transactions', null, 'transactions.userId = users.id')
        .group('users.id');

    if (limitStatement) {
        query.offset(limitStatement.offset());
        query.limit(limitStatement.limit());
    }

    return query;
};

module.exports = Persistence;