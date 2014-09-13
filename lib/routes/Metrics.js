var errors = require('../errors');
var Result = require('../result/Result');
var MountPoint = require('../routing/MountPoint');

function Metrics (persistence) {
    this._persistence = persistence;
}

Metrics.prototype.mountPoint = function () {
    return new MountPoint('get', '/metrics', []);
};

Metrics.prototype.route = function (req, res, next) {
    this._persistence.loadMetrics(function (error, metrics) {
        if (error) return next(new errors.InternalServerError(error.message));

        req.strichliste.result = new Result(metrics, Result.CONTENT_TYPE_JSON);
        next();
    });
};

Metrics.name = 'metrics';

module.exports = Metrics;