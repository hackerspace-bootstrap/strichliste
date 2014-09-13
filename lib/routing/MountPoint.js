function MountPoint (method, path, predecessors) {
    this._method = method;
    this._path = path;
    this.predecessor = predecessors || [];
}

MountPoint.prototype.method = function () {
    return this._method;
};

MountPoint.prototype.path = function () {
    return this._path;
};

MountPoint.prototype.predecessors = function () {
    return this.predecessor;
};

module.exports = MountPoint;