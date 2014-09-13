function cacheMiddlewaresNoop() {
    return {
        pre: function(req, res, next) {
            next();
        },

        post: function(req, res, next) {
            next();
        }
    }
}

function cacheMiddlewares(cache, configuration) {
    if (!configuration.caching.enabled) return cacheMiddlewaresNoop();
}

module.exports = cacheMiddlewares;