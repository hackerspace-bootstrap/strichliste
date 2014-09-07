var errors = require('../errors');
var Result = require('../Result');
var List = require('../List');
var MountPoint = require('../routing/MountPoint');

function TransactionList (userLoader) {
    this._userLoader = userLoader;
}

TransactionList.prototype.mountPoint = function () {
    return new MountPoint('get', '/user/:userId/transaction', ['user']);
};

TransactionList.prototype.route = function (req, res, next) {
    var that = this;

    var orderStatement = req.strichliste.orderStatement;
    var limitStatement = req.strichliste.limitStatement;

    that._userLoader.loadTransactionsByUserId(req.params.userId, limitStatement, orderStatement, function (error, transactions) {
        if (error) return next(new errors.InternalServerError(error.message));
        if (!limitStatement) return end(transactions, transactions.length);

        that._userLoader.loadTransactionsByUserId(req.params.userId, null, null, function (error, transactionsOverall) {
            if (error) return next(new errors.InternalServerError(error.message));

            end(transactions, transactionsOverall.length);
        });
    });

    function end(list, overallNumber) {
        req.strichliste.result = new Result(new List(list, overallNumber, limitStatement), Result.CONTENT_TYPE_JSON);
        next();
    }
};

TransactionList.name = 'transactionList';

module.exports = TransactionList;