function Route () {
}

Route.prototype.mountPoint = function () {
    throw new Error('MountPoint not implemented');
};

module.exports = Route;