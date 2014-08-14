function Routes() {
    this._routes = {};
}

Routes.prototype.addRoute = function (key, route) {
    this._routes[key] = route;

    return this;
};

Routes.prototype.mount = function (app) {
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
};

Routes.prototype.getRoute = function (key) {
    return this._routes[key] || null;
};

module.exports = Routes;