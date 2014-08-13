var util = require('util');

function InternalServerError (message) {
    Error.call(this, message);

    this.errorCode = 500;
    this.message = message;
}
util.inherits(InternalServerError, Error);

function NotFoundError (message) {
    Error.call(this, message);

    this.errorCode = 404;
    this.message = message;
}
util.inherits(NotFoundError, Error);

function InvalidRequestError (message) {
    Error.call(this, message);

    this.errorCode = 400;
    this.message = message;
}

function ForbiddenError (message) {
    Error.call(this, message);

    this.errorCode = 403;
    this.message = message;
}

function ConflictError (message) {
    Error.call(this, message);

    this.errorCode = 409;
    this.message = message;
}

module.exports.InternalServerError = InternalServerError;
module.exports.NotFoundError = NotFoundError;
module.exports.InvalidRequestError = InvalidRequestError;
module.exports.ForbiddenError = ForbiddenError;
module.exports.ConflictError = ConflictError;