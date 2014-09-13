var util = require('util');

var Route = require('../routing/Route');
var errors = require('../errors');
var Result = require('../result/Result');
var List = require('../result/List');
var MountPoint = require('../routing/MountPoint');

function UserList (persistence) {
    Route.call(this);

    this._persistence = persistence;
}

util.inherits(UserList, Route);

UserList.prototype.mountPoint = function () {
    return new MountPoint('get', '/user', []);
};

UserList.prototype.route = function (req, res, next) {
    var that = this;

    var orderStatement = req.strichliste.orderStatement;
    var limitStatement = req.strichliste.limitStatement;

    this._persistence.loadUsers(limitStatement, orderStatement, function (error, users) {
        if (error) return next(new errors.InternalServerError(error.message));
        if (!limitStatement) return end(users, users.length);

        that._persistence.loadUsers(null, null, function (error, usersOverall) {
            if (error) return next(new errors.InternalServerError(error.message));

            end(users, usersOverall.length);
        });
    });

    function end (list, overallNumber) {
        req.strichliste.result = new Result(new List(list, overallNumber, limitStatement), Result.CONTENT_TYPE_JSON);
        next();
    }
};

UserList.routeName = 'User.get';

module.exports = UserList;