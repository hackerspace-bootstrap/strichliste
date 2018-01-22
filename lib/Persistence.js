var util = require('util');

var hoek = require('hoek');
var seq = require('seq');
var squel = require('squel');

var PersistenceBase = require('./Persistence/Persistence');

function Persistence (db) {
    PersistenceBase.call(this, db);
}

util.inherits(Persistence, PersistenceBase);

Persistence.prototype.loadUsers = function (limitStatement, orderStatement, callback) {
    this._queryMany(this._createUserQuery(limitStatement), callback);
};

Persistence.prototype.loadUserById = function (userId, callback) {
    this._queryOne(this._createUserQuery().where('users.id = ?', userId), callback);
};

Persistence.prototype.loadUserByName = function (name, callback) {
    this._queryOne(this._createUserQuery().where('lower(users.name) = ?', name.toLowerCase()), callback);
};

Persistence.prototype.createUser = function (name, mailAddress, callback) {
    var query = squel.insert()
        .into('users')
        .set('name', name)
        .set('mailAddress', mailAddress);

    this._insert(query, callback);
};

Persistence.prototype.createTransaction = function (userId, amount, comment, callback) {
    var query = squel.insert()
        .into('transactions')
        .set('userId', userId)
        .set('value', amount)
        .set('comment', comment);

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

Persistence.prototype.loadMetrics = function (from, callback) {
    var that = this;
    var result = {};

    seq()
        .par(this._createMetricSubStep('select count(*) as countTransactions from transactions', result))
        .par(this._createMetricSubStep('select sum(value) as overallBalance from transactions', result))
        .par(this._createMetricSubStep('select count(*) as countUsers from users', result))
        .par(this._createMetricSubStep('select avg(userBalance) as avgBalance from (select sum(value) as userBalance from transactions group by userId) as ghoti', result))
        .par(function () {
            var done = this;
            that._db.selectMany('select date(createDate) as date, count(*) as overallNumber, count(distinct userid) as distinctUsers, sum(value) as dayBalance, sum(max(value, 0)) as dayBalancePositive, sum(min(value, 0)) as dayBalanceNegative from transactions where createDate >= ? group by date(createDate);', [from], function (error, transactions) {
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
        .field('comment')
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
        .field('users.mailAddress', 'mailAddress')
        .field('coalesce(sum(value),0)', 'balance')
        .field('max(transactions.createDate)', 'lastTransaction')
        .field('count(transactions.createDate)', 'countOfTransactions')
        .field('sum(min(1, max(-transactions.value, 0)))', 'weightedCountOfPurchases')
        .field('count(distinct substr(transactions.createDate, 0, 11))', 'activeDays')
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
