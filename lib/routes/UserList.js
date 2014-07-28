var errors = require('../errors');

function UserList(userLoader) {
    this._userLoader = userLoader;
}

UserList.prototype.route = function(req, res, next) {
    this._userLoader.loadUsers(function(error, users) {
        if (error) {
            return next(new errors.InternalServerError(error.message));
        }

        res.end(JSON.stringify(users));
    })
};

module.exports = UserList;