var errors = require('../errors');
var Result = require('../Result');
var MountPoint = require('../routing/MountPoint');

function TransactionList (userLoader) {
    this._userLoader = userLoader;
}

TransactionList.prototype.mountPoint = function () {
    return new MountPoint('get', '/user/:userId/transaction', ['user']);
};

TransactionList.prototype.route = function (req, res, next) {
    var offset = !isNaN(parseInt(req.query.offset, 10)) ? parseInt(req.query.offset, 10) : null;
    var limit = !isNaN(parseInt(req.query.limit, 10)) ? parseInt(req.query.limit, 10) : null;

    this._userLoader.loadTransactionsByUserId(req.params.userId, offset, limit, function (error, transactions) {
        if (error) return next(new errors.InternalServerError(error.message));

        req.result = new Result(transactions, Result.CONTENT_TYPE_JSON);
        next();
    });
};

module.exports = TransactionList;