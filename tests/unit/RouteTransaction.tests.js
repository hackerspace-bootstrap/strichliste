var expect = require('chai').expect;
var sinon = require('sinon');

var TransactionRoute = require('../../lib/routes/Transaction');
var mocks = require('../util/mocks');

describe('transactionListRoute', function () {
    describe('sucess', function () {
        var userLoader = mocks.createUserPersistenceMock({
            loadTransaction: {
                error: null,
                result: {value: 42}
            }
        });

        var route = new TransactionRoute(userLoader);
        var req = mocks.createRequestMock({
            params: {transactionId: 23}
        });
        var res = mocks.createResponseMock();

        var spy = sinon.spy();
        route.route(req, res, spy);
        var result = req.result;

        it('should call loadTransaction', function () {
            expect(userLoader.loadTransaction.callCount).to.equal(1);
            expect(userLoader.loadTransaction.args[0][0]).to.equal(23);
        });

        it('should return the transactionlist from the userLoader', function () {
            expect(result.content()).to.deep.equal({value: 42});
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
            loadTransaction: {
                error: new Error('caboom'),
                result: null
            }
        });

        var route = new TransactionRoute(userLoader);
        var req = mocks.createRequestMock({
            params: {transactionId: 23}
        });
        var res = mocks.createResponseMock();

        var error;
        route.route(req, res, function (_error) {
            error = _error;
        });

        it('should call loadTransaction', function () {
            expect(userLoader.loadTransaction.callCount).to.equal(1);
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