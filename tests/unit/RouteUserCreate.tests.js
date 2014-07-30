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
        route.route(req, res, function (_error) {
            error = _error;
        });

        it('should return an error if no name is set', function () {
            expect(error.errorCode).to.equal(400);
            expect(error.message).to.equal('name missing');
        });

        it('should not sent any body', function () {
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
        route.route(req, res, function (_error) {
            error = _error;
        });

        it('should return an error if no name is set', function () {
            expect(error.errorCode).to.equal(500);
            expect(error.message).to.equal('error checking user: caboom');
        });

        it('should not sent any body', function () {
            expect(res._end).to.be.null;
        });

        it('should ask the userLoader', function () {
            expect(userLoader.loadUserByName.callCount).to.equal(1);
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
        route.route(req, res, function (_error) {
            error = _error;
        });

        it('should return an error if no name is set', function () {
            expect(error.errorCode).to.equal(409);
            expect(error.message).to.equal('user bert already exists');
        });

        it('should not sent any body', function () {
            expect(res._end).to.be.null;
        });

        it('should ask the userLoader', function () {
            expect(userLoader.loadUserByName.callCount).to.equal(1);
        });
    });

    describe('creation fails', function () {
        var userLoader = mocks.createUserPersistenceMock({
            loadUserByName: { error: null, result: null },
            createUser: {error: new Error('caboom'), result: null}
        });

        var route = new UserCreateRoute(userLoader);
        var req = mocks.createRequestMock({
            body: {name: 'bert'}
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

        it('should ask the userLoader for the name', function () {
            expect(userLoader.loadUserByName.callCount).to.equal(1);
        });

        it('should call createUser', function () {
            expect(userLoader.createUser.callCount).to.equal(1);
            expect(userLoader.createUser.args[0][0]).to.equal('bert');
        });
    });

    describe('aaa', function () {
        var userLoader = mocks.createUserPersistenceMock({
            loadUserByName: { error: null, result: null },
            createUser: {error: null, result: 1337},
            loadUserById: {error: new Error('caboomsel'), result: null}
        });

        var route = new UserCreateRoute(userLoader);
        var req = mocks.createRequestMock({
            body: {name: 'bert'}
        });
        var res = mocks.createResponseMock();

        var error;
        route.route(req, res, function (_error) {
            error = _error;
        });

        it('should return an error if no name is set', function () {
            expect(error.errorCode).to.equal(500);
            expect(error.message).to.equal('error retrieving user: bert');
        });

        it('should not sent any body', function () {
            expect(res._end).to.be.null;
        });

        it('should ask the userLoader for the name', function () {
            expect(userLoader.loadUserByName.callCount).to.equal(1);
        });

        it('should call createUser', function () {
            expect(userLoader.createUser.callCount).to.equal(1);
            expect(userLoader.createUser.args[0][0]).to.equal('bert');
        });

        it('should reload the user', function () {
            expect(userLoader.loadUserById.callCount).to.equal(1);
            expect(userLoader.loadUserById.args[0][0]).to.equal(1337);
        });
    });

    describe('success', function () {
        var userLoader = mocks.createUserPersistenceMock({
            loadUserByName: { error: null, result: null },
            createUser: {error: null, result: 1337},
            loadUserById: {error: null, result: {name: 'bert'}}
        });

        var route = new UserCreateRoute(userLoader);
        var req = mocks.createRequestMock({
            body: {name: 'bert'}
        });
        var res = mocks.createResponseMock();

        var result;
        route.route(req, res, function() {
            result = req.result;
        });

        it('should send a body', function () {
            expect(result.content()).to.deep.equal({"name":"bert"});
        });

        it('should set the correct content type', function() {
            expect(result.contentType()).to.equal('application/json');
        });

        it('should set the correct status code', function() {
            expect(result.statusCode()).to.equal(201);
        });

        it('should ask the userLoader for the name', function () {
            expect(userLoader.loadUserByName.callCount).to.equal(1);
            expect(userLoader.loadUserByName.args[0][0]).to.equal('bert');
        });

        it('should call createUser', function () {
            expect(userLoader.createUser.callCount).to.equal(1);
            expect(userLoader.createUser.args[0][0]).to.equal('bert');
        });

        it('should reload the user', function () {
            expect(userLoader.loadUserById.callCount).to.equal(1);
            expect(userLoader.loadUserById.args[0][0]).to.equal(1337);
        });
    });
});