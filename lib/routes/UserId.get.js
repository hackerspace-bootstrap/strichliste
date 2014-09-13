var util = require('util');

var Route = require('../routing/Route');
var errors = require('../errors');
var Result = require('../result/Result');
var MountPoint = require('../routing/MountPoint');
var LimitStatement = require('../parameters/LimitStatement');

function User (persistence) {
    Route.call(this);

    this._persistence = persistence;
}

util.inherits(User, Route);

User.prototype.mountPoint = function () {
    return new MountPoint('get', '/user/:userId', []);
};

User.prototype.route = function (req, res, next) {
    var that = this;

    this._persistence.loadUserById(req.params.userId, function (error, user) {
        if (error) return next(new errors.InternalServerError(error.message));
        if (!user) return next(new errors.NotFoundError('user ' + req.params.userId + ' not found'));

        that._persistence.loadTransactionsByUserId(req.params.userId, new LimitStatement(5, 0), null, function (error, transactions) {
            if (error) return next(new errors.InternalServerError(error.message));

            user.transactions = transactions;

            req.strichliste.result = new Result(user, Result.CONTENT_TYPE_JSON);
            next();
        });
    });
};

User.routeName = 'UserId.get';

module.exports = User;