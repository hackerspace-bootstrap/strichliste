var OrderStatement = require('./OrderStatement');
var LimitStatement = require('./LimitStatement');

var PATTERN_ORDER = /^(-?)(.*)$/;

function parameterMiddleware() {
    function _parseOrderExpression(orderExpression) {
        if (!orderExpression) return null;

        orderExpression = orderExpression + '';

        var matches = orderExpression.match(PATTERN_ORDER);
        if (matches) {
            return new OrderStatement(matches[2], matches[1] === '-' ? OrderStatement.DESC : OrderStatement.ASC);
        } else {
            return null;
        }

    }

    function _parseLimitExpression(limit, offset) {
        if (!limit && !offset) return null;

        limit = !isNaN(parseInt(limit, 10)) ? parseInt(limit, 10) : null;

        if (limit) {
            return new LimitStatement(limit, !isNaN(parseInt(offset, 10)) ? parseInt(offset, 10) : 0);
        } else {
            return null;
        }
    }

    return function (req, res, next) {
        req.strichliste.limitStatement = _parseLimitExpression(req.query.limit, req.query.offset);
        req.strichliste.orderStatement = _parseOrderExpression(req.query.order);

        next();
    };
}

module.exports = parameterMiddleware;