var expect = require('chai').expect;
var sinon = require('sinon');

var TransactionCreate = require('../../lib/routes/TransactionCreate');
var mocks = require('../util/mocks');

describe('transactionCreateRoute', function () {
    describe('no value', function () {
        var route = new TransactionCreate(null);
        var req = mocks.createRequestMock({
            params: {userId: 1},
            body: {},
            result: {name:'foo'}
        });
        var res = mocks.createResponseMock();

        var error;
        route.route(req, res, function (_error) {
            error = _error;
        });

        it('should return an error if no name is set', function () {
            expect(error.errorCode).to.equal(400);
            expect(error.message).to.equal('not a number: undefined');
        });

        it('should not sent any body', function () {
            expect(res._end).to.be.null;
        });
    });

    describe('zero value', function () {
        var route = new TransactionCreate(null);
        var req = mocks.createRequestMock({
            params: {userId: 1},
            body: {value: 0}
        });
        var res = mocks.createResponseMock();

        var error;
        route.route(req, res, function (_error) {
            error = _error;
        });

        it('should return an error if no name is set', function () {
            expect(error.errorCode).to.equal(400);
            expect(error.message).to.equal('value must not be zero');
        });

        it('should not sent any body', function () {
            expect(res._end).to.be.null;
        });
    });

    describe('creation fails', function () {
        var userLoader = mocks.createUserPersistenceMock({
            loadUserById: { error: null, result: {name: 'bert'} },
            createTransaction: {error: new Error('caboom'), result: null}
        });

        var route = new TransactionCreate(userLoader);
        var req = mocks.createRequestMock({
            body: {value: 42},
            params: {userId: 100},
            result: {name:'foo'}
        });
        var res = mocks.createResponseMock();

        var error;
        route.route(req, res, function (_error) {
            error = _error;
        });

        it('should return an error if no name is set', function () {
            expect(error.errorCode).to.equal(500);
            expect(error.message).to.equal('unexpected: caboom');
        });

        it('should not sent any body', function () {
            expect(res._end).to.be.null;
        });

        it('should call creatTransaction with the correct parameters', function () {
            expect(userLoader.createTransaction.callCount).to.equal(1);
            expect(userLoader.createTransaction.args[0][0]).to.equal(100);
            expect(userLoader.createTransaction.args[0][1]).to.equal(42);
        });
    });

    describe('reload fails', function () {
        var userLoader = mocks.createUserPersistenceMock({
            loadUserById: { error: null, result: {name: 'bert'} },
            createTransaction: {error: null, result: 1337},
            loadTransaction: {error: new Error('caboomsel'), result: null}
        });

        var route = new TransactionCreate(userLoader);
        var req = mocks.createRequestMock({
            body: {value: 1337},
            params: {userId: 1000},
            result: {name:'foo'}
        });
        var res = mocks.createResponseMock();

        var error;
        route.route(req, res, function (_error) {
            error = _error;
        });

        it('should return an error if no name is set', function () {
            expect(error.errorCode).to.equal(500);
            expect(error.message).to.equal('error retrieving transaction: 1337');
        });

        it('should not sent any body', function () {
            expect(res._end).to.be.null;
        });

        it('should call createUser', function () {
            expect(userLoader.createTransaction.callCount).to.equal(1);
            expect(userLoader.createTransaction.args[0][0]).to.equal(1000);
            expect(userLoader.createTransaction.args[0][1]).to.equal(1337);
        });

        it('should reload the user', function () {
            expect(userLoader.loadTransaction.callCount).to.equal(1);
            expect(userLoader.loadTransaction.args[0][0]).to.equal(1337);
        });
    });

    describe('success', function () {
        var userLoader = mocks.createUserPersistenceMock({
            loadUserById: { error: null, result: {name: 'bert'} },
            createTransaction: {error: null, result: 1337},
            loadTransaction: {error: null, result: {value: 123}}
        });

        var route = new TransactionCreate(userLoader);
        var req = mocks.createRequestMock({
            body: {value: 42.1},
            params: {userId: 100},
            result: {name:'foo'}
        });
        var res = mocks.createResponseMock();

        var result;
        route.route(req, res, function() {
            result = req.result;
        });

        it('should send a body', function () {
            expect(result.content()).to.deep.equal({value:123});
        });

        it('should send 201 (created)', function () {
            expect(result.statusCode()).to.equal(201);
        });

        it('should call createTransaction', function () {
            expect(userLoader.createTransaction.callCount).to.equal(1);
            expect(userLoader.createTransaction.args[0][0]).to.equal(100);
            expect(userLoader.createTransaction.args[0][1]).to.equal(42.1);
        });

        it('should reload the transaction', function () {
            expect(userLoader.loadTransaction.callCount).to.equal(1);
            expect(userLoader.loadTransaction.args[0][0]).to.equal(1337);
        });
    });
});