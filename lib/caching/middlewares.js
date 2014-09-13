function createPreMiddleware () {
    return function (req, res, next) {
        next();
    };
}

function createPostMiddleware() {
    return function (req, res, next) {
        next();
    };
}

function cacheMiddlewares (cache, configuration) {
    return {
        pre: createPreMiddleware(cache),
        post: createPostMiddleware(cache)
    };
}

module.exports = cacheMiddlewares;