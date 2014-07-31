var expect = require('chai').expect;
var sinon = require('sinon');

var TransactionListRoute = require('../../lib/routes/TransactionList');
var mocks = require('../util/mocks');

describe('transactionListRoute', function () {
    describe('sucess', function () {
        var userLoader = mocks.createUserPersistenceMock({
            loadTransactionsByUserId: {
                error: null,
                result: [1, 2, 3]
            }
        });

        var route = new TransactionListRoute(userLoader);
        var req = mocks.createRequestMock({
            params: {userId: 42}
        });
        var res = mocks.createResponseMock();

        var spy = sinon.spy();
        route.route(req, res, spy);
        var result = req.result;

        it('should call the loadTransactionsByUserId', function () {
            expect(userLoader.loadTransactionsByUserId.callCount).to.equal(1);
            expect(userLoader.loadTransactionsByUserId.args[0][0]).to.equal(42);
        });

        it('should return the transactionlist from the userLoader', function () {
            expect(result.content()).to.deep.equal([1, 2, 3]);
        });

        it('should set the correct content type', function () {
            expect(result.contentType()).to.equal('application/json');
        });

        it('should set the correct status code', function () {
            expect(result.statusCode()).to.equal(200);
        });

        it('should call the next method', function () {
            expect(spy.callCount).to.equal(1);
        });
    });

    describe('fail', function () {
        var userLoader = mocks.createUserPersistenceMock({
            loadTransactionsByUserId: {
                error: new Error('caboom'),
                result: null
            }
        });

        var route = new TransactionListRoute(userLoader);
        var req = mocks.createRequestMock();
        var res = mocks.createResponseMock();

        var error;
        route.route(req, res, function (_error) {
            error = _error;
        });

        it('should call the loadTransactionsByUserId', function () {
            expect(userLoader.loadTransactionsByUserId.callCount).to.equal(1);
        });

        it('should call next with an eror', function () {
            expect(error.errorCode).to.equal(500);
            expect(error.message).to.equal('caboom');
        });

        it('should not send a body', function () {
            expect(res._end).to.be.null;
        });
    });
});