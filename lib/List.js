function List (entries, overallCount, limitStatement) {
    this._entries = entries;
    this._overallCount = overallCount;
    this._limitStatement = limitStatement;
}

List.prototype.toObject = function () {
    var limit = null;
    var offset = null;

    if (this._limitStatement) {
        limit = this._limitStatement.limit();
        offset = this._limitStatement.offset();
    }

    return {
        overallCount: this._overallCount,
        limit: limit,
        offset: offset,
        entries: this._entries
    };
};

module.exports = List;