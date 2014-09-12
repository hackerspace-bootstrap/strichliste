function errorHandler(error, req, res, next) {
    res
        .status(error.errorCode)
        .send({message: error.message});
}

module.exports = errorHandler;