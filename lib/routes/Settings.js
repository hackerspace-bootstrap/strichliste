var configuration = require('../configuration');
var errors = require('../errors');
var Result = require('../Result');
var MountPoint = require('../routing/MountPoint');

function Settings() {
}

Settings.prototype.mountPoint = function () {
    return new MountPoint('get', '/settings', []);
};

Settings.prototype.route = function (req, res, next) {
    var settings = {
        boundaries: configuration.boundaries.account
    };

    req.strichliste.result = new Result(settings, Result.CONTENT_TYPE_JSON);
    next();
};

module.exports = Settings;