var seq = require('seq');

var errors = require('../errors');
var Result = require('../Result');
var MountPoint = require('../routing/MountPoint');

function UserCreate (userLoader) {
    this._userLoader = userLoader;
}

UserCreate.prototype.mountPoint = function () {
    return new MountPoint('post', '/user', []);
};

UserCreate.prototype.route = function (req, res, next) {
    var that = this;

    var name = ((req.body.name || '') + '').trim();

    if (!name) {
        return next(new errors.InvalidRequestError('name missing'));
    }

    seq()
        .seq(function () {
            var done = this;

            that._userLoader.loadUserByName(name, function (error, result) {
                if (error) return next(new errors.InternalServerError('error checking user: ' + error.message));

                if (result) return next(new errors.ConflictError('user ' + name + ' already exists'));

                done();
            })
        })
        .seq(function () {
            that._userLoader.createUser(name, this);
        })
        .seq(function (userId) {
            that._userLoader.loadUserById(userId, function (error, result) {
                if (error) return next(new errors.InternalServerError('error retrieving user: ' + name));

                req.result = new Result(result, Result.CONTENT_TYPE_JSON, 201);
                next();
            });
        })
        .catch(function (error) {
            next(new errors.InternalServerError('unexpected: ' + error.message));
        });
};

module.exports = UserCreate;