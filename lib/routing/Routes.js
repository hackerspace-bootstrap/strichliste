function Routes() {
    this._routes = {};
}

Routes.prototype.addRoute = function(key, route) {
    this._routes[key] = route;

    return this;
};

Routes.prototype.mount = function(app) {
    var that = this;

    Object.keys(this._routes).forEach(function(routeKey) {
        var route = that._routes[routeKey];
        var mountPoint = route.mountPoint();

        app[mountPoint.method()].call(app, mountPoint.path(), route.route.bind(route));
    });
};

module.exports = Routes;