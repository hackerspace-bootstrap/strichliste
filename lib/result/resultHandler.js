var errors = require('../errors');

function resultHandler(req, res, next) {
    var result = req.strichliste.result;

    if (!result) return next(new errors.NotFoundError('route ' + req.method + ' ' + req.path + ' not found'));

    res
        .status(result.statusCode())
        .set('Content-Type', result.contentType())
        .send(result.content());
}

module.exports = resultHandler;