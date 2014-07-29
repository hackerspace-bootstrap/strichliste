var util = require('util');

var seq = require('seq');

var errors = require('../errors');
var Route = require('../routing/Route');
var MountPoint = require('../routing/MountPoint');

function UserCreate (userLoader) {
    Route.call(this);

    this._userLoader = userLoader;
}

util.inherits(UserCreate, Route);

UserCreate.prototype.mountPoint = function () {
    return new MountPoint('put', '/user');
};

UserCreate.prototype.route = function (req, res, next) {
    var that = this;

    var name = (req.body.name || '' + '').trim();
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
        .seq(function (id) {
            that._userLoader.loadUserById(id, function (error, result) {
                if (error) return next(new errors.InternalServerError('error retrieving user: ' + name));

                res
                    .status(201)
                    .end(JSON.stringify(result));
            });
        })
        .catch(function (error) {
            next(new errors.InternalServerError('unexpected: ' + error.message));
        });
};

module.exports = UserCreate;