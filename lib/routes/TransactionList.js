var errors = require('../errors');
var Result = require('../Result');
var MountPoint = require('../routing/MountPoint');

function TransactionList(userLoader) {
    this._userLoader = userLoader;
}

TransactionList.prototype.mountPoint = function () {
    return new MountPoint('get', '/user/:userId/transaction', ['user']);
};

TransactionList.prototype.route = function (req, res, next) {
    var orderStatement = req.strichliste.orderStatement;
    var limitStatement = req.strichliste.limitStatement;

    this._userLoader.loadTransactionsByUserId(req.params.userId, limitStatement, orderStatement, function (error, transactions) {
        if (error) return next(new errors.InternalServerError(error.message));

        req.strichliste.result = new Result(transactions, Result.CONTENT_TYPE_JSON);
        next();
    });
};

module.exports = TransactionList;