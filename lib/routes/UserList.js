var util = require('util');

var errors = require('../errors');
var Route = require('../routing/Route');
var MountPoint = require('../routing/MountPoint');

function UserList(userLoader) {
    Route.call(this);

    this._userLoader = userLoader;
}

util.inherits(UserList, Route);

UserList.prototype.mountPoint = function() {
    return new MountPoint('get', '/user');
};

UserList.prototype.route = function(req, res, next) {
    this._userLoader.loadUsers(function(error, users) {
        if (error) {
            return next(new errors.InternalServerError(error.message));
        }

        res.end(JSON.stringify(users));
    })
};

module.exports = UserList;