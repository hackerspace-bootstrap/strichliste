var errors = require('../errors');

function User(userLoader) {
    this._userLoader = userLoader;
}

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