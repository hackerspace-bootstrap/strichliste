var util = require('util');

var errors = require('../errors');
var Route = require('../routing/Route');
var Result = require('../Result');
var MountPoint = require('../routing/MountPoint');

function Transaction (userLoader) {
    Route.call(this);

    this._userLoader = userLoader;
}

util.inherits(Transaction, Route);

Transaction.prototype.mountPoint = function () {
    return new MountPoint('get', '/user/:userId/transaction/:transactionId', ['user']);
};

Transaction.prototype.route = function (req, res, next) {
    this._userLoader.loadTransaction(req.params.transactionId, function (error, transaction) {
        if (error) return next(new errors.InternalServerError(error.message));

        req.result = new Result(transaction, Result.CONTENT_TYPE_JSON);
        next();
    });
};

module.exports = Transaction;