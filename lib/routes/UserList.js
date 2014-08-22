var errors = require('../errors');
var Result = require('../Result');
var MountPoint = require('../routing/MountPoint');
var List = require('../List');

function UserList (userLoader) {
    this._userLoader = userLoader;
}

UserList.prototype.mountPoint = function () {
    return new MountPoint('get', '/user', []);
};

UserList.prototype.route = function (req, res, next) {
    var that = this;

    var orderStatement = req.strichliste.orderStatement;
    var limitStatement = req.strichliste.limitStatement;

    this._userLoader.loadUsers(limitStatement, orderStatement, function (error, users) {
        if (error) return next(new errors.InternalServerError(error.message));

        if (!limitStatement) {
            req.strichliste.result = new Result(new List(users, users.length, limitStatement), Result.CONTENT_TYPE_JSON);
            return next();
        }

        that._userLoader.loadUsers(null, null, function (error, usersOverall) {
            if (error) return next(new errors.InternalServerError(error.message));

            req.strichliste.result = new Result(new List(users, usersOverall.length, limitStatement), Result.CONTENT_TYPE_JSON);
            next();
        });
    });
};

module.exports = UserList;