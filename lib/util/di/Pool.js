function Pool() {
    this._entities = {};
}

Pool.prototype.register = function(name, entity) {
    this._entities[name] = entity;
};

Pool.prototype.retrieve = function(name) {
    return this._entities[name] || null;
};

module.exports = Pool;