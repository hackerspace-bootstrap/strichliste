function Route() {

}

Route.prototype.mountPoint = function() {
    throw new Error('mountPoint not implemented');
};

module.exports = Route;