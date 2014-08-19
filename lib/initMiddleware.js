function InitMiddleware () {
    return function (req, res, next) {
        req.strichliste = {};

        next();
    };
}

module.exports = InitMiddleware;