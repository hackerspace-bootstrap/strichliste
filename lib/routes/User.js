var util = require('util');

var errors = require('../errors');
var Route = require('../routing/Route');
var MountPoint = require('../routing/MountPoint');

function User(userLoader) {
    Route.call(this);

    this._userLoader = userLoader;
}

util.inherits(User, Route);

User.prototype.mountPoint = function() {
    return new MountPoint('get', '/user/:id');
};

User.prototype.route = function(req, res, next) {
    this._userLoader.loadUserById(req.params.id, function(error, user) {
        if (error) {
            return next(new errors.InternalServerError(error.message));
        }

        if (!user) {
            return next(new errors.NotFoundError('user ' + req.params.id + ' not found'));
        }

        res.end(JSON.stringify(user));
    })
};

module.exports = User;