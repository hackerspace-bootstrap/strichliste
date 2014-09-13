var expect = require('chai').use(require('sinon-chai')).expect;

var LimitStatement = require('../../lib/parameters/LimitStatement');
var TransactionListRoute = require('../../lib/routes/Transaction.get');
var mocks = require('../util/mocks');

describe('transactionListRoute', function () {
    describe('success /w limit', function () {
        var limitStatement = new LimitStatement(10, 20);
        var persistence = mocks.createPersistenceMock({
            loadTransactions: { error: null, result: [1, 2, 3] }
        });

        var route = new TransactionListRoute(persistence);
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

        it('should call the loadTransactionByUserId method two times', function () {
            expect(persistence.loadTransactions).to.be.calledTwice;
        });

        it('should call loadTransactions with correct parameters', function () {
            expect(persistence.loadTransactions).to.be.calledWith(limitStatement, 'fooOrderSt');
            expect(persistence.loadTransactions).to.be.calledWith(null, null);
        });

        it('should return the transactionlist from the persistence', function () {
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

    describe('success /wo limit', function () {
        var persistence = mocks.createPersistenceMock({
            loadTransactions: { error: null, result: [1, 2, 3] }
        });

        var route = new TransactionListRoute(persistence);
        var req = mocks.createRequestMock({
            params: {userId: 42},
            query: {},
            strichliste: {
                orderStatement: null,
                limitStatement: null
            }
        });
        var res = mocks.createResponseMock();

        before(function (done) {
            route.route(req, res, done);
        });

        it('should call the loadTransactionByUserId method only once', function () {
            expect(persistence.loadTransactions).to.be.calledOnce;
        });

        it('should call the loadTransactions with correct parameters', function () {
            expect(persistence.loadTransactions).to.be.calledWith(null, null);
        });

        it('should return the transactionlist from the persistence', function () {
            expect(req.strichliste.result.content()).to.deep.equal({
                overallCount: 3,
                limit: null,
                offset: null,
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
        var persistence = mocks.createPersistenceMock({
            loadTransactions: {
                error: new Error('caboom'),
                result: null
            }
        });

        var route = new TransactionListRoute(persistence);
        var req = mocks.createRequestMock({
            query: {}
        });
        var res = mocks.createResponseMock();

        var error;
        route.route(req, res, function (_error) {
            error = _error;
        });

        it('should call the loadTransactions', function () {
            expect(persistence.loadTransactions).to.be.calledOnce;
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