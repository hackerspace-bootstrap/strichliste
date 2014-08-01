var errors = require('../errors');
var Result = require('../Result');
var MountPoint = require('../routing/MountPoint');

function UserList (userLoader) {
    this._userLoader = userLoader;
}

UserList.prototype.mountPoint = function () {
    return new MountPoint('get', '/user', []);
};

UserList.prototype.route = function (req, res, next) {
    this._userLoader.loadUsers(function (error, users) {
        if (error) return next(new errors.InternalServerError(error.message));

        req.result = new Result(users, Result.CONTENT_TYPE_JSON);
        next();
    });
};

module.exports = UserList;