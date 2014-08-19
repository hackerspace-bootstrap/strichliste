var seq = require('seq');

var errors = require('../errors');
var Result = require('../Result');
var List = require('../List');
var MountPoint = require('../routing/MountPoint');

function TransactionList (userLoader) {
    this._userLoader = userLoader;
}

TransactionList.prototype.mountPoint = function () {
    return new MountPoint('get', '/user/:userId/transaction', ['user']);
};

TransactionList.prototype.route = function (req, res, next) {
    var that = this;

    var orderStatement = req.strichliste.orderStatement;
    var limitStatement = req.strichliste.limitStatement;

    seq()
        .par('transactions', function () {
            that._userLoader.loadTransactionsByUserId(req.params.userId, limitStatement, orderStatement, this);
        })
        .par('overallCount', function () {
            var done = this;
            that._userLoader.loadTransactionsByUserId(req.params.userId, null, null, function (error, transactions) {
                if (error) return done(error);

                done(null, transactions.length);
            });
        })
        .seq(function () {
            req.strichliste.result = new Result(new List(this.vars.transactions, this.vars.overallCount, limitStatement), Result.CONTENT_TYPE_JSON);
            next();
        })
        .catch(function (error) {
            next(new errors.InternalServerError(error.message));
        });

};

module.exports = TransactionList;