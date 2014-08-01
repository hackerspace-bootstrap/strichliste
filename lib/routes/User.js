var errors = require('../errors');
var Result = require('../Result');
var MountPoint = require('../routing/MountPoint');

function User (userLoader) {
    this._userLoader = userLoader;
}

User.prototype.mountPoint = function () {
    return new MountPoint('get', '/user/:userId', []);
};

User.prototype.route = function (req, res, next) {
    this._userLoader.loadUserById(req.params.userId, function (error, user) {
        if (error) return next(new errors.InternalServerError(error.message));
        if (!user) return next(new errors.NotFoundError('user ' + req.params.userId + ' not found'));

        req.result = new Result(user, Result.CONTENT_TYPE_JSON);
        next();
    });
};

module.exports = User;