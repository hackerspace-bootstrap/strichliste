var util = require('util');

function StrichlisteError (message, errorCode) {
    Error.call(this, this.message);

    this.message = message;
    this.errorCode = errorCode;
}
util.inherits(StrichlisteError, Error);

function InternalServerError (message) {
    StrichlisteError.call(this, message, 500);
}
util.inherits(InternalServerError, StrichlisteError);

function NotFoundError (message) {
    StrichlisteError.call(this, message, 404);
}
util.inherits(NotFoundError, StrichlisteError);

function InvalidRequestError (message) {
    StrichlisteError.call(this, message, 400);
}
util.inherits(InvalidRequestError, StrichlisteError);

function ForbiddenError (message) {
    StrichlisteError.call(this, message, 403);
}
util.inherits(ForbiddenError, StrichlisteError);

function ConflictError (message) {
    StrichlisteError.call(this, message, 409);
}
util.inherits(ConflictError, StrichlisteError);

module.exports.StrichlisteError = StrichlisteError;
module.exports.InternalServerError = InternalServerError;
module.exports.NotFoundError = NotFoundError;
module.exports.InvalidRequestError = InvalidRequestError;
module.exports.ForbiddenError = ForbiddenError;
module.exports.ConflictError = ConflictError;