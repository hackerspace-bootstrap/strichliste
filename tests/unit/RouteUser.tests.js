var expect = require('chai').expect;
var sinon = require('sinon');

var UserRoute = require('../../lib/routes/User');
var mocks = require('../util/mocks');

describe('userRoute', function () {
    describe('sucess', function () {
        var userLoader = mocks.createUserPersistenceMock({
            loadUserById: { error: null, result: {name: 'bert'} }
        });

        var route = new UserRoute(userLoader);
        var req = mocks.createRequestMock({
            params: {id: 1}
        });
        var res = mocks.createResponseMock();

        var spy = sinon.spy();
        route.route(req, res, spy);

        it('should return the user from the userLoader', function () {
            expect(res._end).to.equal('{"name":"bert"}');
        });

        it('should not call next', function() {
            expect(spy.callCount).to.equal(0);
        });

        it('should ask the userPersistence with id 1', function() {
            expect(userLoader.loadUserById.args[0][0]).to.equal(1);
        });
    });

    describe('not found', function () {
        var userLoader = mocks.createUserPersistenceMock({
            loadUserById: { error: null, result: null }
        });

        var route = new UserRoute(userLoader);
        var req = mocks.createRequestMock({
            params: {id: 1}
        });
        var res = mocks.createResponseMock();

        var error, result;
        route.route(req, res, function (_error, _result) {
            error = _error;
            result = _result;
        });

        it('should return a not found error', function () {
            expect(error.message).to.equal('user 1 not found');
            expect(error.errorCode).to.equal(404);
        });

        it('should not return a body', function() {
            expect(res._end).to.be.null;
        });

        it('should ask the userPersistence with id 1', function() {
            expect(userLoader.loadUserById.args[0][0]).to.equal(1);
        });
    });

    describe('fail', function () {
        var userLoader = mocks.createUserPersistenceMock({
            loadUserById: { error: new Error('caboom'), result: null }
        });

        var route = new UserRoute(userLoader);
        var req = mocks.createRequestMock({
            params: {id: 1}
        });
        var res = mocks.createResponseMock();

        var error, result;
        route.route(req, res, function (_error, _result) {
            error = _error;
            result = _result;
        });

        it('should return a an internal server error', function () {
            expect(error.message).to.equal('caboom');
            expect(error.errorCode).to.equal(500);
        });

        it('should not return a body', function() {
            expect(res._end).to.be.null;
        });

        it('should ask the userPersistence with id 1', function() {
            expect(userLoader.loadUserById.args[0][0]).to.equal(1);
        });
    });
});