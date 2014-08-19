var expect = require('chai').use(require('sinon-chai')).expect;

var LimitStatement = require('../../lib/parameters/LimitStatement');
var TransactionListRoute = require('../../lib/routes/TransactionList');
var mocks = require('../util/mocks');

describe('transactionListRoute', function () {
    describe('success', function () {
        var limitStatement = new LimitStatement(10, 20);
        var userLoader = mocks.createUserPersistenceMock({
            loadTransactionsByUserId: { error: null, result: [1, 2, 3] }
        });

        var route = new TransactionListRoute(userLoader);
        var req = mocks.createRequestMock({
            params: {userId: 42},
            query: {},
            strichliste: {
                orderStatement: 'fooOrderSt',
                limitStatement: limitStatement
            }
        });
        var res = mocks.createResponseMock();

        before(function (done) {
            route.route(req, res, done);
        });

        it('should call the loadTransactionsByUserId with correct parameters', function () {
            expect(userLoader.loadTransactionsByUserId).to.be.calledTwice;
            expect(userLoader.loadTransactionsByUserId).to.be.calledWith(42, limitStatement, 'fooOrderSt');
            expect(userLoader.loadTransactionsByUserId).to.be.calledWith(42, null, null);
        });

        it('should return the transactionlist from the userLoader', function () {
            expect(req.strichliste.result.content()).to.deep.equal({
                overallCount: 3,
                limit: 10,
                offset: 20,
                entries: [1, 2, 3]
            });
        });

        it('should set the correct content type', function () {
            expect(req.strichliste.result.contentType()).to.equal('application/json');
        });

        it('should set the correct status code', function () {
            expect(req.strichliste.result.statusCode()).to.equal(200);
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
        var req = mocks.createRequestMock({
            query: {}
        });
        var res = mocks.createResponseMock();

        var error;
        route.route(req, res, function (_error) {
            error = _error;
        });

        it('should call the loadTransactionsByUserId', function () {
            expect(userLoader.loadTransactionsByUserId).to.be.calledTwice;
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