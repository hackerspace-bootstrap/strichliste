OrderStatement.ASC = 'asc';
OrderStatement.DESC = 'desc';

function OrderStatement (field, direction) {
    this._field = field;
    this._direction = direction || OrderStatement.ASC;
}

OrderStatement.prototype.field = function () {
    return this._field;
};

OrderStatement.prototype.direction = function () {
    return this._direction;
};

module.exports = OrderStatement;