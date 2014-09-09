var errors = require('../errors');
var Result = require('../result/Result');
var MountPoint = require('../routing/MountPoint');

function Settings (configuration) {
    this._configuration = configuration;
}

Settings.prototype.mountPoint = function () {
    return new MountPoint('get', '/settings', []);
};

Settings.prototype.route = function (req, res, next) {
    var settings = {
        boundaries: this._configuration.boundaries.account
    };

    req.strichliste.result = new Result(settings, Result.CONTENT_TYPE_JSON);
    next();
};

Settings.name = 'settings';

module.exports = Settings;