var errors = require('../errors');
var Result = require('../Result');
var MountPoint = require('../routing/MountPoint');

function Metrics (userLoader) {
    this._userLoader = userLoader;
}

Metrics.prototype.mountPoint = function () {
    return new MountPoint('get', '/metrics', []);
};

Metrics.prototype.route = function (req, res, next) {
    this._userLoader.loadMetrics(function (error, metrics) {
        if (error) return next(new errors.InternalServerError(error.message));

        req.strichliste.result = new Result(metrics, Result.CONTENT_TYPE_JSON);
        next();
    });
};

Metrics.name = 'metrics';

module.exports = Metrics;