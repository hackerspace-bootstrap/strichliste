var MountPoint = require('../../../lib/routing/MountPoint');

function Route2 (bar) {
    this._bar = bar;
}

Route2.prototype.mountPoint = function () {
    return new MountPoint('get', '/route2', ['Route1']);
};

Route2.prototype.route = function (req, res, next) {

};

Route2.prototype.route.bind = function (req, res, next) {
    return 'route to route2';
};

Route2.routeName = 'Route2';

module.exports = Route2;