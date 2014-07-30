function MountPoint (method, path, predecessors) {
    this._method = method;
    this._path = path;
    this._predessesors = predecessors || [];
}

MountPoint.prototype.method = function () {
    return this._method;
};

MountPoint.prototype.path = function () {
    return this._path;
};

MountPoint.prototype.predecessors = function() {
    return this._predessesors;
};

module.exports = MountPoint;