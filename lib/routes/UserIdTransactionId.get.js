var util = require('util');

var Route = require('../routing/Route');
var errors = require('../errors');
var Result = require('../result/Result');
var MountPoint = require('../routing/MountPoint');

function UserTransaction (persistence) {
    Route.call(this);

    this._persistence = persistence;
}

util.inherits(UserTransaction, Route);

UserTransaction.prototype.mountPoint = function () {
    return new MountPoint('get', '/user/:userId/transaction/:transactionId', ['UserId.get']);
};

UserTransaction.prototype.route = function (req, res, next) {
    this._persistence.loadTransaction(req.params.transactionId, function (error, transaction) {
        if (error) return next(new errors.InternalServerError(error.message));

        req.strichliste.result = new Result(transaction, Result.CONTENT_TYPE_JSON);
        next();
    });
};

UserTransaction.routeName = 'UserIdTransactionId.get';

module.exports = UserTransaction;