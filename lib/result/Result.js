var List = require('./List');

function Result (content, contentType, statusCode) {
    this._content = content;
    this._contentType = contentType;
    this._statusCode = statusCode || 200;
}

Result.prototype.content = function () {
    if (this._content instanceof List) {
        return this._content.toObject();
    }

    return this._content;
};

Result.prototype.contentType = function () {
    return this._contentType;
};

Result.prototype.statusCode = function () {
    return this._statusCode;
};

Result.CONTENT_TYPE_JSON = 'application/json';

module.exports = Result;