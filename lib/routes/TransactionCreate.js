var util = require('util');

var seq = require('seq');

var errors = require('../errors');
var Route = require('../routing/Route');
var Result = require('../Result');
var MountPoint = require('../routing/MountPoint');

function TransactionCreate (userLoader, mqttWrapper) {
    Route.call(this);

    this._userLoader = userLoader;
    this._mqttWrapper = mqttWrapper;
}

util.inherits(TransactionCreate, Route);

TransactionCreate.prototype.mountPoint = function () {
    return new MountPoint('put', '/user/:userId/transaction', ['user']);
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

    if (!req.result) {
        return next(new errors.InternalServerError('previous stage result missing'));
    }

    seq()
        .seq(function () {
            that._userLoader.createTransaction(userId, value, this);
        })
        .seq(function (transactionId) {
            that._userLoader.loadTransaction(transactionId, function (error, result) {
                if (error) {
                    return next(new errors.InternalServerError('error retrieving transaction: ' + transactionId));
                }

                that._mqttWrapper.publishTransactionValue(value);

                req.result = new Result(result, Result.CONTENT_TYPE_JSON, 201);
                next();
            });
        })
        .catch(function (error) {
            next(new errors.InternalServerError('unexpected: ' + error.message));
        });
};

module.exports = TransactionCreate;