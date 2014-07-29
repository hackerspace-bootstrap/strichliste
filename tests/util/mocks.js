var sinon = require('sinon');

function createRequestMock (options) {
    options = options || {};

    return {
        params: options.params || {},
        body: options.body || {}
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
        })
    };
}

module.exports = {
    createRequestMock: createRequestMock,
    createResponseMock: createResponseMock,
    createUserPersistenceMock: createUserPersistenceMock
};