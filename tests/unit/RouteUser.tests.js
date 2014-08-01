var expect = require('chai').expect;
var sinon = require('sinon');

var UserRoute = require('../../lib/routes/User');
var mocks = require('../util/mocks');

describe('userRoute', function () {
    describe('sucess', function () {
        var userLoader = mocks.createUserPersistenceMock({
            loadUserById: { error: null, result: {name: 'bert'} },
            loadTransactionsByUserId: { error: null, result: [1,2,3]}
        });

        var route = new UserRoute(userLoader);
        var req = mocks.createRequestMock({
            params: {userId: 1}
        });
        var res = mocks.createResponseMock();

        var spy = sinon.spy();
        route.route(req, res, spy);
        var result = req.result;

        it('should return the user from the userLoader', function () {
            expect(result.content()).to.deep.equal({name: 'bert', transactions: [1,2,3]});
        });

        it('should set the correct content type', function () {
            expect(result.contentType()).to.equal('application/json');
        });

        it('should set the correct status code', function () {
            expect(result.statusCode()).to.equal(200);
        });

        it('should call next', function () {
            expect(spy.callCount).to.equal(1);
        });

        it('should ask the userPersistence for userId 1 (userLoad)', function () {
            expect(userLoader.loadUserById.args[0][0]).to.equal(1);
        });

        it('should ask the userPersistence for userId 1 (transactionLoad)', function () {
            expect(userLoader.loadTransactionsByUserId.args[0][0]).to.equal(1);
        });
    });

    describe('loadTransaction fails', function () {
        var userLoader = mocks.createUserPersistenceMock({
            loadUserById: { error: null, result: {name: 'bert'} },
            loadTransactionsByUserId: { error: new Error('caboom!'), result: null}
        });

        var route = new UserRoute(userLoader);
        var req = mocks.createRequestMock({
            params: {userId: 1}
        });
        var res = mocks.createResponseMock();

        var error, result;
        route.route(req, res, function (_error) {
            error = _error;
        });

        it('should return a an internal server error', function () {
            expect(error.message).to.equal('caboom!');
            expect(error.errorCode).to.equal(500);
        });

        it('should not return a body', function () {
            expect(res._end).to.be.null;
        });

        it('should ask the userPersistence with id 1', function () {
            expect(userLoader.loadUserById.args[0][0]).to.equal(1);
        });

        it('should ask the userPersistence for userId 1 (transactionLoad)', function () {
            expect(userLoader.loadTransactionsByUserId.args[0][0]).to.equal(1);
        });
    });

    describe('not found', function () {
        var userLoader = mocks.createUserPersistenceMock({
            loadUserById: { error: null, result: null }
        });

        var route = new UserRoute(userLoader);
        var req = mocks.createRequestMock({
            params: {userId: 1}
        });
        var res = mocks.createResponseMock();

        var error;
        route.route(req, res, function (_error) {
            error = _error;
        });

        it('should return a not found error', function () {
            expect(error.message).to.equal('user 1 not found');
            expect(error.errorCode).to.equal(404);
        });

        it('should not return a body', function () {
            expect(res._end).to.be.null;
        });

        it('should ask the userPersistence with id 1', function () {
            expect(userLoader.loadUserById.args[0][0]).to.equal(1);
        });
    });

    describe('fail', function () {
        var userLoader = mocks.createUserPersistenceMock({
            loadUserById: { error: new Error('caboom'), result: null }
        });

        var route = new UserRoute(userLoader);
        var req = mocks.createRequestMock({
            params: {userId: 1}
        });
        var res = mocks.createResponseMock();

        var error, result;
        route.route(req, res, function (_error) {
            error = _error;
        });

        it('should return a an internal server error', function () {
            expect(error.message).to.equal('caboom');
            expect(error.errorCode).to.equal(500);
        });

        it('should not return a body', function () {
            expect(res._end).to.be.null;
        });

        it('should ask the userPersistence with id 1', function () {
            expect(userLoader.loadUserById.args[0][0]).to.equal(1);
        });
    });
});