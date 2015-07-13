function errorHandler(error, req, res, next) {
    res
        .status(error.errorCode || error.statusCode || 500)
        .send({message: error.message || 'Undefined error'});
}

module.exports = errorHandler;