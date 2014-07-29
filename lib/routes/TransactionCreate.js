var util = require('util');

var seq = require('seq');

var errors = require('../errors');
var Route = require('../routing/Route');
var MountPoint = require('../routing/MountPoint');

function TransactionCreate(userLoader) {
    Route.call(this);

    this._userLoader = userLoader;
}

util.inherits(TransactionCreate, Route);

TransactionCreate.prototype.mountPoint = function() {
    return new MountPoint('put', '/user/:id/transaction');
};

TransactionCreate.prototype.route = function(req, res, next) {
    var that = this;

    var value = req.body.value;
    var userId = req.params.id;

    if (!value) {
        return next(new errors.InvalidRequestError('value has the wrong format: ' + value));
    }

    seq()
        .seq(function() {
            var done = this;

            that._userLoader.loadUserById(userId, function(error, result) {
                if (error) return next(new errors.InternalServerError('error checking user'));

                if (!result) return next(new errors.NotFoundError('user ' + userId + ' not found'));

                done();
            });
        })
        .seq(function() {
            that._userLoader.createTransaction(userId, value, this);
        })
        .seq(function(transactionId) {
                console.log( transactionId, 'bar' );
            that._userLoader.loadTransaction(transactionId, function(error, result) {
                if (error) return next(new errors.InternalServerError('error retrieving transaction: ' + transactionId));

                res.end(JSON.stringify(result));
            });
        })
        .catch(function(error) {
            next(new errors.InternalServerError('unexpected : ' + error.message));
        });
};

module.exports = TransactionCreate;