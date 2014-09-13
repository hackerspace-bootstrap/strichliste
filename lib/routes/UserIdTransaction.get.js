var util = require('util');

var Route = require('../routing/Route');
var errors = require('../errors');
var Result = require('../result/Result');
var List = require('../result/List');
var MountPoint = require('../routing/MountPoint');

function TransactionList (persistence) {
    Route.call(this);

    this._persistence = persistence;
}

util.inherits(TransactionList, Route);

TransactionList.prototype.mountPoint = function () {
    return new MountPoint('get', '/user/:userId/transaction', ['UserId.get']);
};

TransactionList.prototype.route = function (req, res, next) {
    var that = this;

    var orderStatement = req.strichliste.orderStatement;
    var limitStatement = req.strichliste.limitStatement;

    that._persistence.loadTransactionsByUserId(req.params.userId, limitStatement, orderStatement, function (error, transactions) {
        if (error) return next(new errors.InternalServerError(error.message));
        if (!limitStatement) return end(transactions, transactions.length);

        that._persistence.loadTransactionsByUserId(req.params.userId, null, null, function (error, transactionsOverall) {
            if (error) return next(new errors.InternalServerError(error.message));

            end(transactions, transactionsOverall.length);
        });
    });

    function end (list, overallNumber) {
        req.strichliste.result = new Result(new List(list, overallNumber, limitStatement), Result.CONTENT_TYPE_JSON);
        next();
    }
};

TransactionList.routeName = 'UserIdTransaction.get';

module.exports = TransactionList;