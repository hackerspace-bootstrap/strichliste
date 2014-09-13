var cachingMiddlewares = require('../caching/middlewares');

function cachingMiddlewaresNoop() {
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
    if (!configuration.caching.enabled) return cachingMiddlewaresNoop();

    return cachingMiddlewares(cache, configuration);
}

module.exports = cacheMiddlewares;