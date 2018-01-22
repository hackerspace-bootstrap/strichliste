var sinon = require('sinon');

function createResultMock (content) {
    return {
        content: function () {
            return content;
        }
    }
}

function createAppMock () {
    return {
        get: sinon.spy()
    }
}

function createRequestMock (options) {
    options = options || {};

    return {
        params: options.params || {},
        body: options.body || {},
        query: options.query || null,
        strichliste: options.strichliste || {}
    }
}

function createResponseMock () {
    return {
        _end: null,
        _status: null,

        end: function (data) {
            this._end = data;
            return this;
        },
        status: function (status) {
            this._status = status;
            return this;
        }
    }
}

function createPersistenceMock (options) {
    options = options || {};

    return {
        loadUsers: sinon.spy(function (limitStatement, orderStatement, callback) {
            callback(options.loadUsers.error, options.loadUsers.result);
        }),
        loadUserById: sinon.spy(function (id, callback) {
            callback(options.loadUserById.error, options.loadUserById.result);
        }),
        loadUserByName: sinon.spy(function (name, callback) {
            callback(options.loadUserByName.error, options.loadUserByName.result);
        }),
        createUser: sinon.spy(function (name, mailAddress, callback) {
            callback(options.createUser.error, options.createUser.result);
        }),
        createTransaction: sinon.spy(function (userId, value, comment, callback) {
            callback(options.createTransaction.error, options.createTransaction.result);
        }),
        loadTransaction: sinon.spy(function (transactionId, callback) {
            callback(options.loadTransaction.error, options.loadTransaction.result);
        }),
        loadTransactions: sinon.spy(function (limit, order, callback) {
            callback(options.loadTransactions.error, options.loadTransactions.result);
        }),
        loadTransactionsByUserId: sinon.spy(function (transactionId, offset, limit, callback) {
            callback(options.loadTransactionsByUserId.error, options.loadTransactionsByUserId.result);
        }),
        loadMetrics: sinon.spy(function (startDate, callback) {
            callback(options.loadMetrics.error, options.loadMetrics.result);
        })
    };
}

function createMqttWrapperMock () {
    return {
        publishTransactionValue: sinon.spy()
    };
}

function createMqttClientMock () {
    return {
        publish: sinon.spy()
    };
}

function createMqttMock (emitter) {
    return {
        createClient: sinon.spy(function (port, host) {
            return emitter;
        })
    };
}

function createDBMock (options) {
    options = options || {};

    var i = 0;
    return {
        selectOne: sinon.spy(function (query, parameters, callback) {
            var error = Array.isArray(options.selectOne.error) ? options.selectOne.error[i] : options.selectOne.error;
            var result = Array.isArray(options.selectOne.result) ? options.selectOne.result[i] : options.selectOne.result;
            i++;

            callback(error, result);
        }),
        selectMany: sinon.spy(function (query, parameters, callback) {
            var error = Array.isArray(options.selectMany.error) ? options.selectMany.error[i] : options.selectMany.error;
            var result = Array.isArray(options.selectMany.result) ? options.selectMany.result[i] : options.selectMany.result;
            i++;

            callback(error, result);
        }),
        query: sinon.spy(function (query, parameters, callback) {
            var error = Array.isArray(options.query.error) ? options.query.error[i] : options.query.error;
            var result = Array.isArray(options.query.result) ? options.query.result[i] : options.query.result;
            i++;

            callback(error, result);
        })
    }
}

module.exports = {
    createResultMock: createResultMock,
    createRequestMock: createRequestMock,
    createResponseMock: createResponseMock,
    createPersistenceMock: createPersistenceMock,
    createDBMock: createDBMock,
    createMqttWrapperMock: createMqttWrapperMock,
    createMqttClientMock: createMqttClientMock,
    createAppMock: createAppMock,
    createMqttMock: createMqttMock
};
