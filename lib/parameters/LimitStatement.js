function LimitStatement(limit, offset) {
    this._limit = limit;
    this._offset = offset;
}

LimitStatement.prototype.limit = function() {
    return this._limit;
};

LimitStatement.prototype.offset = function() {
    return this._offset;
};

module.exports = LimitStatement;