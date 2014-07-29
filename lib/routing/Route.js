function Route () {
}

Route.prototype.mount = function (app) {
    if (!this.mountPoint || !this.mountPoint()) {
        throw new Error('mountPoint not defined');
    }

    var mountPoint = this.mountPoint();

    app[mountPoint.method()].call(app, mountPoint.path(), this.route.bind(this));
};

module.exports = Route;