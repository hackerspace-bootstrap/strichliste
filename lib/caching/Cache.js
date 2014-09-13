function Cache() {
    this._cache = {};
}

Cache.prototype.set = function(key, parameters, value) {
    if (!this._cache[key]) this._cache[key] = {};

    if (!parameters) parameters = '';

    this._cache[key][parameters] = value;
};

Cache.prototype.get = function(key, parameters) {
    if (!parameters) parameters = '';

    return (this._cache[key] && this._cache[key][parameters]) || null;
};

Cache.prototype.clear = function(key) {
    if (this._cache[key]) {
        delete this._cache[key];
    }
};

module.exports = Cache;