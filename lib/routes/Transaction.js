var errors = require('../errors');
var Result = require('../Result');
var MountPoint = require('../routing/MountPoint');

function Transaction (userLoader) {
    this._userLoader = userLoader;
}

Transaction.prototype.mountPoint = function () {
    return new MountPoint('get', '/user/:userId/transaction/:transactionId', ['user']);
};

Transaction.prototype.route = function (req, res, next) {
    this._userLoader.loadTransaction(req.params.transactionId, function (error, transaction) {
        if (error) return next(new errors.InternalServerError(error.message));

        req.strichliste.result = new Result(transaction, Result.CONTENT_TYPE_JSON);
        next();
    });
};

Transaction.name = 'transaction';

module.exports = Transaction;