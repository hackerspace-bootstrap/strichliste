var path = require('path');
var fs = require('fs');

function RoutesLoader (baseDir, injector) {
    this._baseDir = baseDir;
    this._injector = injector;
    this._routes = {};
}

RoutesLoader.prototype.load = function () {
    var that = this;

    fs
        .readdirSync(this._baseDir)
        .forEach(function (file) {
            var route = require(path.join(that._baseDir, file));
            that.addRoute(route.name, that._injector.equip(route));
        });

    return this;
};

RoutesLoader.prototype.mount = function (app) {
    var that = this;

    Object.keys(this._routes).forEach(function (routeKey) {
        var route = that._routes[routeKey];
        var mountPoint = route.mountPoint();

        var mountParameters = [mountPoint.path()];

        mountPoint.predecessors().forEach(function (predKey) {
            var predesessor = that.getRoute(predKey);

            if (!predesessor) throw new Error('could not load predecessor: ' + predKey);

            mountParameters.push(predesessor.route.bind(predesessor));
        });

        mountParameters.push(route.route.bind(route));

        app[mountPoint.method()].apply(app, mountParameters);
    });

    return this;
};

RoutesLoader.prototype.addRoute = function (key, route) {
    this._routes[key] = route;
};

RoutesLoader.prototype.getRoute = function (key) {
    return this._routes[key] || null;
};

module.exports = RoutesLoader;