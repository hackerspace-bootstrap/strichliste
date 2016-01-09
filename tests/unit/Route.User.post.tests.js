var expect = require('chai').use(require('sinon-chai')).expect;

var UserCreateRoute = require('../../lib/routes/User.post');
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
        var persistence = mocks.createPersistenceMock({
            loadUserByName: { error: new Error('caboom'), result: null }
        });

        var route = new UserCreateRoute(persistence);
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

        it('should ask the persistence', function () {
            expect(persistence.loadUserByName).to.be.calledOnce;
        });
    });

    describe('user exists', function () {
        var persistence = mocks.createPersistenceMock({
            loadUserByName: { error: null, result: {name: 'bert'} }
        });

        var route = new UserCreateRoute(persistence);
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

        it('should ask the persistence', function () {
            expect(persistence.loadUserByName).to.be.calledOnce;
        });
    });

    describe('creation fails', function () {
        var persistence = mocks.createPersistenceMock({
            loadUserByName: { error: null, result: null },
            createUser: {error: new Error('caboom'), result: null}
        });

        var route = new UserCreateRoute(persistence);
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

        it('should ask the persistence for the name', function () {
            expect(persistence.loadUserByName).to.be.calledOnce;
        });

        it('should call createUser', function () {
            expect(persistence.createUser).to.be.calledOnce;
            expect(persistence.createUser).to.be.calledWith('bert');
        });
    });

    describe('aaa', function () {
        var persistence = mocks.createPersistenceMock({
            loadUserByName: { error: null, result: null },
            createUser: {error: null, result: 1337},
            loadUserById: {error: new Error('caboomsel'), result: null}
        });

        var route = new UserCreateRoute(persistence);
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

        it('should ask the persistence for the name', function () {
            expect(persistence.loadUserByName).to.be.calledOnce;
        });

        it('should call createUser', function () {
            expect(persistence.createUser).to.be.calledOnce;
            expect(persistence.createUser).to.be.calledWith('bert');
        });

        it('should reload the user', function () {
            expect(persistence.loadUserById).to.be.calledOnce;
            expect(persistence.loadUserById).to.be.calledWith(1337);
        });
    });

    describe('success', function () {
        var persistence = mocks.createPersistenceMock({
            loadUserByName: { error: null, result: null },
            createUser: {error: null, result: 1337},
            loadUserById: {error: null, result: {name: 'bert', mailAddress: 'bertMail'}}
        });

        var route = new UserCreateRoute(persistence);
        var req = mocks.createRequestMock({
            body: {name: 'bert', mailAddress: 'bertMail'}
        });
        var res = mocks.createResponseMock();

        var result;
        route.route(req, res, function () {
            result = req.strichliste.result;
        });

        it('should send a body', function () {
            expect(result.content()).to.deep.equal({"name": "bert", "mailAddress": "bertMail"});
        });

        it('should set the correct content type', function () {
            expect(result.contentType()).to.equal('application/json');
        });

        it('should set the correct status code', function () {
            expect(result.statusCode()).to.equal(201);
        });

        it('should ask the persistence for the name', function () {
            expect(persistence.loadUserByName).to.be.calledOnce;
            expect(persistence.loadUserByName).to.be.calledWith('bert');
        });

        it('should call createUser', function () {
            expect(persistence.createUser).to.be.calledOnce;
            expect(persistence.createUser).to.be.calledWith('bert', 'bertMail');
        });

        it('should reload the user', function () {
            expect(persistence.loadUserById).to.be.calledOnce;
            expect(persistence.loadUserById).to.be.calledWith(1337);
        });
    });

    describe('success, name special case (number)', function () {
        var persistence = mocks.createPersistenceMock({
            loadUserByName: { error: null, result: null },
            createUser: {error: null, result: 1337},
            loadUserById: {error: null, result: {name: 'bert', 'mailAddress': 'bertMail'}}
        });

        var route = new UserCreateRoute(persistence);
        var req = mocks.createRequestMock({
            body: {name: 10, mailAddress: 'bertMail'}
        });
        var res = mocks.createResponseMock();

        var result;
        route.route(req, res, function () {
            result = req.strichliste.result;
        });

        it('should send a body', function () {
            expect(result.content()).to.deep.equal({"name": "bert", "mailAddress": "bertMail"});
        });

        it('should set the correct content type', function () {
            expect(result.contentType()).to.equal('application/json');
        });

        it('should set the correct status code', function () {
            expect(result.statusCode()).to.equal(201);
        });

        it('should ask the persistence for the name', function () {
            expect(persistence.loadUserByName).to.be.calledOnce;
            expect(persistence.loadUserByName).to.be.calledWith('10');
        });

        it('should call createUser', function () {
            expect(persistence.createUser).to.be.calledOnce;
            expect(persistence.createUser).to.be.calledWith('10', 'bertMail');
        });

        it('should reload the user', function () {
            expect(persistence.loadUserById).to.be.calledOnce;
            expect(persistence.loadUserById).to.be.calledWith(1337);
        });
    });

    describe('success, name special case (\')', function () {
        var persistence = mocks.createPersistenceMock({
            loadUserByName: { error: null, result: null },
            createUser: {error: null, result: 1337},
            loadUserById: {error: null, result: {name: 'bert', mailAddress: 'bertMail'}}
        });

        var route = new UserCreateRoute(persistence);
        var req = mocks.createRequestMock({
            body: {name: '\'', mailAddress: 'bertMail'}
        });
        var res = mocks.createResponseMock();

        var result;
        route.route(req, res, function () {
            result = req.strichliste.result;
        });

        it('should send a body', function () {
            expect(result.content()).to.deep.equal({"name": "bert", "mailAddress": "bertMail"});
        });

        it('should set the correct content type', function () {
            expect(result.contentType()).to.equal('application/json');
        });

        it('should set the correct status code', function () {
            expect(result.statusCode()).to.equal(201);
        });

        it('should ask the persistence for the name', function () {
            expect(persistence.loadUserByName).to.be.calledOnce;
            expect(persistence.loadUserByName).to.be.calledWith('\'');
        });

        it('should call createUser', function () {
            expect(persistence.createUser).to.be.calledOnce;
            expect(persistence.createUser).to.be.calledWith('\'', 'bertMail');
        });

        it('should reload the user', function () {
            expect(persistence.loadUserById).to.be.calledOnce;
            expect(persistence.loadUserById).to.be.calledWith(1337);
        });
    });
});