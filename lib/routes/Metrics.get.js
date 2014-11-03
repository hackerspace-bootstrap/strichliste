var util = require('util');

var moment = require('moment');

var Route = require('../routing/Route');
var errors = require('../errors');
var Result = require('../result/Result');
var MountPoint = require('../routing/MountPoint');

function Metrics (persistence, configuration) {
    Route.call(this);

    this._persistence = persistence;
    this._days = configuration.metrics.timespan;
}

util.inherits(Metrics, Route);

Metrics.prototype.mountPoint = function () {
    return new MountPoint('get', '/metrics', []);
};

Metrics.prototype.route = function (req, res, next) {
    var from = moment().subtract(this._days, 'days');

    this._persistence.loadMetrics(from.format('YYYY-MM-DD'), function (error, metrics) {
        if (error) return next(new errors.InternalServerError(error.message));

        var newDays = [];
        var days = metrics.days;
        var indexedDays = {};

        days.forEach(function(day) {
            indexedDays[day.date] = day;
        });

        var now = moment();

        while(from.isBefore(now) || from.isSame(now)) {
            if (indexedDays[from.format('YYYY-MM-DD')]) {
                newDays.push(indexedDays[from.format('YYYY-MM-DD')]);
            } else {
                newDays.push({
                    date: from.format('YYYY-MM-DD'),
                    overallNumber: 0,
                    distinctUsers: 0,
                    dayBalance: 0,
                    dayBalancePositive: 0,
                    dayBalanceNegative: 0
                });
            }

            from.add(1, 'd');
        }

        metrics.days = newDays;

        req.strichliste.result = new Result(metrics, Result.CONTENT_TYPE_JSON);
        next();
    });
};

Metrics.routeName = 'Metrics.get';

module.exports = Metrics;