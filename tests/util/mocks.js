var sinon = require('sinon');

function createAppMock() {
    return {
        get: sinon.spy()
    }
}

function createRequestMock (options) {
    options = options || {};

    return {
        params: options.params || {},
        body: options.body || {},
        result: options.result || null,
        query: options.query || null
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

function createUserPersistenceMock (options) {
    options = options || {};

    return {
        loadUsers: sinon.spy(function (callback) {
            callback(options.loadUsers.error, options.loadUsers.result);
        }),
        loadUserById: sinon.spy(function (id, callback) {
            callback(options.loadUserById.error, options.loadUserById.result);
        }),
        loadUserByName: sinon.spy(function (name, callback) {
            callback(options.loadUserByName.error, options.loadUserByName.result);
        }),
        createUser: sinon.spy(function (name, callback) {
            callback(options.createUser.error, options.createUser.result);
        }),
        createTransaction: sinon.spy(function (userId, value, callback) {
            callback(options.createTransaction.error, options.createTransaction.result);
        }),
        loadTransaction: sinon.spy(function (transactionId, callback) {
            callback(options.loadTransaction.error, options.loadTransaction.result);
        }),
        loadTransactionsByUserId: sinon.spy(function (transactionId, offset, limit, callback) {
            callback(options.loadTransactionsByUserId.error, options.loadTransactionsByUserId.result);
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

function createDBMock (options) {
    options = options || {};

    return {
        selectOne: sinon.spy(function (query, arguments, callback) {
            callback(options.selectOne.error, options.selectOne.result);
        }),
        selectMany: sinon.spy(function (query, arguments, callback) {
            callback(options.selectMany.error, options.selectMany.result);
        }),
        query: sinon.spy(function (query, arguments, callback) {
            callback(options.query.error, options.query.result);
        })
    }
}

module.exports = {
    createRequestMock: createRequestMock,
    createResponseMock: createResponseMock,
    createUserPersistenceMock: createUserPersistenceMock,
    createDBMock: createDBMock,
    createMqttWrapperMock: createMqttWrapperMock,
    createMqttClientMock: createMqttClientMock,
    createAppMock: createAppMock
};