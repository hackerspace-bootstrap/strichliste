var util = require('util');

var errors = require('../errors');
var Route = require('../routing/Route');
var Result = require('../Result');
var MountPoint = require('../routing/MountPoint');

function TransactionList (userLoader) {
    Route.call(this);

    this._userLoader = userLoader;
}

util.inherits(TransactionList, Route);

TransactionList.prototype.mountPoint = function () {
    return new MountPoint('get', '/user/:userId/transaction', ['user']);
};

TransactionList.prototype.route = function (req, res, next) {
    this._userLoader.loadTransactionsByUserId(req.params.userId, function (error, transactions) {
        if (error) return next(new errors.InternalServerError(error.message));

        req.result = new Result(transactions, Result.CONTENT_TYPE_JSON);
        next();
    });
};

module.exports = TransactionList;