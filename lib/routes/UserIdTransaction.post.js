var util = require('util');

var seq = require('seq');

var Route = require('../routing/Route');
var errors = require('../errors');
var Result = require('../result/Result');
var MountPoint = require('../routing/MountPoint');
var configuration = require('../configuration');

function TransactionCreate (persistence, mqttWrapper) {
    Route.call(this);

    this._persistence = persistence;
    this._mqttWrapper = mqttWrapper;
}

util.inherits(TransactionCreate, Route);

TransactionCreate.prototype.mountPoint = function () {
    return new MountPoint('post', '/user/:userId/transaction', ['UserId.get']);
};

TransactionCreate.prototype.route = function (req, res, next) {
    var that = this;

    var value = parseFloat(req.body.value);
    var userId = req.params.userId;
    var comment = req.body.comment;
    var toUserId = req.body.toUserId;

    if (isNaN(value)) {
        return next(new errors.InvalidRequestError('not a number: ' + req.body.value));
    }
    if (value === 0) {
        return next(new errors.InvalidRequestError('value must not be zero'));
    }
    if (!req.strichliste.result) {
        return next(new errors.InternalServerError('previous stage result missing'));
    }

    if (value < configuration.boundaries.transaction.lower || toUserId && ((value * -1) < configuration.boundaries.transaction.lower)) {
        return next(new errors.ForbiddenError('transaction value of ' + value + ' falls below the transaction minimum of ' + configuration.boundaries.transaction.lower));
    }
    if (value > configuration.boundaries.transaction.upper || toUserId && ((value * -1) > configuration.boundaries.transaction.upper)) {
        return next(new errors.ForbiddenError('transaction value of ' + value + ' exceeds the transaction maximum of ' + configuration.boundaries.transaction.upper));
    }

    if (toUserId) {
        that._persistence.loadUserById(toUserId, function (error, targetUser) {
            if (error) return next(new errors.InternalServerError(error.message));
            if (!targetUser) return next(new errors.NotFoundError('user ' + toUserId + ' not found'));

            var newTargetUserBalance = targetUser.balance - value;

            if (value > 0 && newTargetUserBalance < configuration.boundaries.account.lower) {
                return next(new errors.ForbiddenError('transaction value of ' + (-1 * value) + ' leads to an overall account balance of ' + newTargetUserBalance + 'which goes below the lower account limit of ' + configuration.boundaries.account.lower));
            }
            if (value < 0 && newTargetUserBalance > configuration.boundaries.account.upper) {
                return next(new errors.ForbiddenError('transaction value of ' + (-1 * value) + ' leads to an overall account balance of ' + newTargetUserBalance + ' which goes beyond the upper account limit of ' + configuration.boundaries.account.upper));
            }

            seq()
                .seq(function () {
                    that._persistence.createTransaction(toUserId, -1 * value, comment, this);
                })
                .seq(function (transactionId) {
                    that._persistence.loadTransaction(transactionId, function (error, result) {
                        if (error) return next(new errors.InternalServerError('error retrieving transaction: ' + transactionId));

                        that._mqttWrapper.publishTransactionValue(value);

                        req.strichliste.result = new Result(result, Result.CONTENT_TYPE_JSON, 201);
                        end();
                    });
                })
                .catch(function (error) {
                    next(new errors.InternalServerError('unexpected: ' + error.message));
                });
        });
    }
    else {
        end();
    }

    function end (){
        var user = req.strichliste.result.content();
        var newBalance = user.balance + value;
        if (value < 0 && newBalance < configuration.boundaries.account.lower) {
            return next(new errors.ForbiddenError('transaction value of ' + value + ' leads to an overall account balance of ' + newBalance + ' which goes below the lower account limit of ' + configuration.boundaries.account.lower));
        }

        if (value > 0 && newBalance > configuration.boundaries.account.upper) {
            return next(new errors.ForbiddenError('transaction value of ' + value + ' leads to an overall account balance of ' + newBalance + ' which goes beyond the upper account limit of ' + configuration.boundaries.account.upper));
        }

        seq()
            .seq(function () {
                that._persistence.createTransaction(userId, value, comment, this);
            })
            .seq(function (transactionId) {
                that._persistence.loadTransaction(transactionId, function (error, result) {
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
};

TransactionCreate.routeName = 'UserIdTransaction.post';

module.exports = TransactionCreate;
