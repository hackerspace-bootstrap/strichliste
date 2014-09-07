var PATTERN = /function ([^\(]+) *\(([^\)]+)\)/;

function Injector(pool) {
    this._pool = pool;
    this._cache = {};
}

Injector.prototype.create = function(name, depth) {
    var that = this;
    depth = depth || 0;

    if (depth > 10) throw new Error('circular dependency detected');
    if (this._cache[name]) return this._cache[name];

    var Entity = this._pool.retrieve(name);

    if (!this._isFunction(Entity)) return Entity;

    var dependencies = this._retrieveDependencies(Entity)
        .map(function(dependencyName) {
            return that.create(dependencyName, ++depth);
        });

    var created = this._createEntity(Entity, dependencies);

    this._cache[name] = created;

    return created;
};

Injector.prototype._retrieveDependencies = function(entity) {
    var matches = entity.toString().match(PATTERN);
    if (matches.length == 0) return [];

    var argumentString = matches[2];
    return argumentString
        .split(',')
        .map(function(piece) {
            return piece.trim();
        });
};

Injector.prototype._createEntity = function(Entity, dependencies) {
    function F() {
        return Entity.apply(this, dependencies);
    }

    F.prototype = Entity.prototype;
    return new F();
};

Injector.prototype._isFunction = function(entity) {
    return typeof entity === 'function';
};

module.exports = Injector;