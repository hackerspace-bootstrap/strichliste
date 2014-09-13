var util = require('util');

var Route = require('../routing/Route');
var errors = require('../errors');
var Result = require('../result/Result');
var List = require('../result/List');
var MountPoint = require('../routing/MountPoint');

function Transaction (persistence) {
    Route.call(this);

    this._persistence = persistence;
}

util.inherits(Transaction, Route);

Transaction.prototype.mountPoint = function () {
    return new MountPoint('get', '/transaction', []);
};

Transaction.prototype.route = function (req, res, next) {
    var that = this;

    var orderStatement = req.strichliste.orderStatement;
    var limitStatement = req.strichliste.limitStatement;

    that._persistence.loadTransactions(limitStatement, orderStatement, function (error, transactions) {
        if (error) return next(new errors.InternalServerError(error.message));
        if (!limitStatement) return end(transactions, transactions.length);

        that._persistence.loadTransactions(null, null, function (error, transactionsOverall) {
            if (error) return next(new errors.InternalServerError(error.message));

            end(transactions, transactionsOverall.length);
        });
    });

    function end (list, overallNumber) {
        req.strichliste.result = new Result(new List(list, overallNumber, limitStatement), Result.CONTENT_TYPE_JSON);
        next();
    }
};

Transaction.routeName = 'Transaction.get';

module.exports = Transaction;