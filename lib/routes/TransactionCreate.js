var seq = require('seq');

var errors = require('../errors');
var Result = require('../Result');
var MountPoint = require('../routing/MountPoint');
var configuration = require('../configuration');

function TransactionCreate(userLoader, mqttWrapper) {
    this._userLoader = userLoader;
    this._mqttWrapper = mqttWrapper;
}

TransactionCreate.prototype.mountPoint = function () {
    return new MountPoint('post', '/user/:userId/transaction', ['user']);
};

TransactionCreate.prototype.route = function (req, res, next) {
    var that = this;

    var value = parseFloat(req.body.value);
    var userId = req.params.userId;

    if (isNaN(value)) {
        return next(new errors.InvalidRequestError('not a number: ' + req.body.value));
    }
    if (value === 0) {
        return next(new errors.InvalidRequestError('value must not be zero'));
    }
    if (!req.strichliste.result) {
        return next(new errors.InternalServerError('previous stage result missing'));
    }

    if (value < configuration.boundaries.transaction.lower) {
        return next(new errors.ForbiddenError('transaction value of ' + value + ' falls below the transaction minimum of ' + configuration.boundaries.transaction.lower));
    }
    if (value > configuration.boundaries.transaction.upper) {
        return next(new errors.ForbiddenError('transaction value of ' + value + ' exceeds the transaction maximum of ' + configuration.boundaries.transaction.upper));
    }

    var user = req.strichliste.result.content();
    var newBalance = user.balance + value;
    if (newBalance < configuration.boundaries.account.lower) {
        return next(new errors.ForbiddenError('transaction value of ' + value + ' leads to an overall account balance of ' + newBalance + ' which goes below the lower account limit of ' + configuration.boundaries.account.lower));
    }

    if (newBalance > configuration.boundaries.account.upper) {
        return next(new errors.ForbiddenError('transaction value of ' + value + ' leads to an overall account balance of ' + newBalance + ' which goes beyond the upper account limit of ' + configuration.boundaries.account.upper));
    }

    seq()
        .seq(function () {
            that._userLoader.createTransaction(userId, value, this);
        })
        .seq(function (transactionId) {
            that._userLoader.loadTransaction(transactionId, function (error, result) {
                if (error) return next(new errors.InternalServerError('error retrieving transaction: ' + transactionId));

                that._mqttWrapper.publishTransactionValue(value);

                req.strichliste.result = new Result(result, Result.CONTENT_TYPE_JSON, 201);
                next();
            });
        })
        .catch(function (error) {
            next(new errors.InternalServerError('unexpected: ' + error.message));
        });
};

module.exports = TransactionCreate;