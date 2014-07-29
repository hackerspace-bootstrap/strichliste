var expect = require('chai').expect;
var sinon = require('sinon');

var UserCreateRoute = require('../../lib/routes/UserCreate');
var mocks = require('../util/mocks');

describe('userCreateRoute', function () {
    describe('no name', function () {
        var route = new UserCreateRoute(null);
        var req = mocks.createRequestMock({
            body: {}
        });
        var res = mocks.createResponseMock();

        var error;
        route.route(req, res, function(_error) {
            error = _error;
        });

        it('should return an error if no name is set', function () {
            expect(error.errorCode).to.equal(400);
            expect(error.message).to.equal('name missing');
        });

        it('should not sent any body', function() {
            expect(res._end).to.be.null;
        });
    });

    describe('user check fails', function () {
        var userLoader = mocks.createUserPersistenceMock({
            loadUserByName: { error: new Error('caboom'), result: null }
        });

        var route = new UserCreateRoute(userLoader);
        var req = mocks.createRequestMock({
            body: {name: 'bert'}
        });
        var res = mocks.createResponseMock();

        var error;
        route.route(req, res, function(_error) {
            error = _error;
        });

        it('should return an error if no name is set', function () {
            expect(error.errorCode).to.equal(500);
            expect(error.message).to.equal('error checking user: caboom');
        });

        it('should not sent any body', function() {
            expect(res._end).to.be.null;
        });
    });

    describe('user exists', function () {
        var userLoader = mocks.createUserPersistenceMock({
            loadUserByName: { error: null, result: {name: 'bert'} }
        });

        var route = new UserCreateRoute(userLoader);
        var req = mocks.createRequestMock({
            body: {name: 'bert'}
        });
        var res = mocks.createResponseMock();

        var error;
        route.route(req, res, function(_error) {
            error = _error;
        });

        it('should return an error if no name is set', function () {
            expect(error.errorCode).to.equal(409);
            expect(error.message).to.equal('user bert already exists');
        });

        it('should not sent any body', function() {
            expect(res._end).to.be.null;
        });
    });
});