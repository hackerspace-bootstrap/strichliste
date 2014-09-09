var errors = require('../errors');
var Result = require('../result/Result');
var MountPoint = require('../routing/MountPoint');
var LimitStatement = require('../parameters/LimitStatement');

function User (userLoader) {
    this._userLoader = userLoader;
}

User.prototype.mountPoint = function () {
    return new MountPoint('get', '/user/:userId', []);
};

User.prototype.route = function (req, res, next) {
    var that = this;

    this._userLoader.loadUserById(req.params.userId, function (error, user) {
        if (error) return next(new errors.InternalServerError(error.message));
        if (!user) return next(new errors.NotFoundError('user ' + req.params.userId + ' not found'));

        that._userLoader.loadTransactionsByUserId(req.params.userId, new LimitStatement(5, 0), null, function (error, transactions) {
            if (error) return next(new errors.InternalServerError(error.message));

            user.transactions = transactions;

            req.strichliste.result = new Result(user, Result.CONTENT_TYPE_JSON);
            next();
        });
    });
};

User.name = 'user';

module.exports = User;