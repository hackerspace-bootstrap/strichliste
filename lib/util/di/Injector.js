var PATTERN = /function ([^\(]+) *\(([^\)]+)\)/;

function Injector() {
    this._pool = {};
    this._cache = {};
}

Injector.prototype.register = function (name, entity) {
    this._pool[name] = entity;
};

Injector.prototype.equip = function (Entity, depth) {
    var that = this;
    depth = depth || 0;

    var dependencies = this._retrieveDependencies(Entity)
        .map(function (dependencyName) {
            return that.create(dependencyName, ++depth);
        });

    return this._createEntity(Entity, dependencies);
};

Injector.prototype.create = function (name, depth) {
    depth = depth || 0;

    if (depth > 10) throw new Error('circular dependency detected');
    if (this._cache[name]) return this._cache[name];

    var entity = this.retrieve(name);

    if (this._isFunction(entity)) {
        entity = this.equip(entity, depth);
    }

    this._cache[name] = entity;

    return entity;
};

Injector.prototype._retrieveDependencies = function (entity) {
    var matches = entity.toString().match(PATTERN);

    if (matches == null) return [];

    var argumentString = matches[2];
    return argumentString
        .split(',')
        .map(function (piece) {
            return piece.trim();
        });
};

Injector.prototype._createEntity = function (Entity, dependencies) {
    function F () {
        return Entity.apply(this, dependencies);
    }

    F.prototype = Entity.prototype;
    return new F();
};

Injector.prototype._isFunction = function (entity) {
    return typeof entity === 'function';
};

Injector.prototype.retrieve = function (name) {
    if (this._pool[name] !== undefined) return this._pool[name];

    throw new Error('unmet dependency: ' + name);
};

module.exports = Injector;