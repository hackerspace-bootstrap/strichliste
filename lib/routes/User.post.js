var util = require('util');

var seq = require('seq');

var Route = require('../routing/Route');
var errors = require('../errors');
var Result = require('../result/Result');
var MountPoint = require('../routing/MountPoint');

function UserCreate (persistence) {
    Route.call(this);

    this._persistence = persistence;
}

util.inherits(UserCreate, Route);

UserCreate.prototype.mountPoint = function () {
    return new MountPoint('post', '/user', []);
};

UserCreate.prototype.route = function (req, res, next) {
    var that = this;

    var name = String(req.body.name || '').trim();
    var mailAddress = String(req.body.mailAddress || '').trim();

    if (!name) return next(new errors.InvalidRequestError('name missing'));

    seq()
        .seq(function () {
            var done = this;

            that._persistence.loadUserByName(name, function (error, result) {
                if (error) return next(new errors.InternalServerError('error checking user: ' + error.message));
                if (result) return next(new errors.ConflictError('user ' + name + ' already exists'));

                done();
            });
        })
        .seq(function () {
            that._persistence.createUser(name, mailAddress, this);
        })
        .seq(function (userId) {
            that._persistence.loadUserById(userId, function (error, result) {
                if (error) return next(new errors.InternalServerError('error retrieving user: ' + name));

                req.strichliste.result = new Result(result, Result.CONTENT_TYPE_JSON, 201);
                next();
            });
        })
        .catch(function (error) {
            next(new errors.InternalServerError('unexpected: ' + error.message));
        });
};

UserCreate.routeName = 'User.post';

module.exports = UserCreate;