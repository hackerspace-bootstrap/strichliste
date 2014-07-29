var util = require('util');

var seq = require('seq');

var errors = require('../errors');
var Route = require('../routing/Route');
var MountPoint = require('../routing/MountPoint');

function TransactionCreate (userLoader) {
    Route.call(this);

    this._userLoader = userLoader;
}

util.inherits(TransactionCreate, Route);

TransactionCreate.prototype.mountPoint = function () {
    return new MountPoint('put', '/user/:userId/transaction');
};

TransactionCreate.prototype.route = function (req, res, next) {
    var that = this;

    var value = parseInt(req.body.value, 10);
    var userId = req.params.userId;

    if (isNaN(value)) {
        return next(new errors.InvalidRequestError('not a number: ' + req.body.value));
    }

    if (value === 0) {
        return next(new errors.InvalidRequestError('value must not be zero'));
    }

    seq()
        .seq(function () {
            var done = this;

            that._userLoader.loadUserById(userId, function (error, result) {
                if (error) return next(new errors.InternalServerError('error checking user: ' + error.message));

                if (!result) return next(new errors.NotFoundError('user ' + userId + ' not found'));

                done();
            });
        })
        .seq(function () {
            that._userLoader.createTransaction(userId, value, this);
        })
        .seq(function (transactionId) {
            that._userLoader.loadTransaction(transactionId, function (error, result) {
                if (error) return next(new errors.InternalServerError('error retrieving transaction: ' + transactionId));

                res
                    .status(201)
                    .end(JSON.stringify(result));
            });
        })
        .catch(function (error) {
            next(new errors.InternalServerError('unexpected: ' + error.message));
        });
};

module.exports = TransactionCreate;