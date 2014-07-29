function MountPoint(method, path) {
    this._method = method;
    this._path = path;
}

MountPoint.prototype.method = function() {
    return this._method;
};

MountPoint.prototype.path = function() {
    return this._path;
};

module.exports = MountPoint;