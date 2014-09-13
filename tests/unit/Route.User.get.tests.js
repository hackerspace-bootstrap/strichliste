var expect = require('chai').use(require('sinon-chai')).expect;
var sinon = require('sinon');

var LimitStatement = require('../../lib/parameters/LimitStatement');
var UserListRoute = require('../../lib/routes/User.get');
var mocks = require('../util/mocks');

describe('userListRoute', function () {
    describe('sucess', function () {
        var persistence = mocks.createPersistenceMock({
            loadUsers: {
                error: null,
                result: [1, 2, 3]
            }
        });

        var route = new UserListRoute(persistence);
        var req = mocks.createRequestMock();
        var res = mocks.createResponseMock();

        var spy = sinon.spy();
        route.route(req, res, spy);
        var result = req.strichliste.result;

        it('should call the loadUserMethod', function () {
            expect(persistence.loadUsers).to.be.calledOnce;
        });

        it('should return the userlist from the persistence', function () {
            expect(result.content()).to.deep.equal({
                entries: [1, 2, 3],
                limit: null,
                offset: null,
                overallCount: 3
            });
        });

        it('should set the correct content type', function () {
            expect(result.contentType()).to.equal('application/json');
        });

        it('should set the correct status code', function () {
            expect(result.statusCode()).to.equal(200);
        });

        it('should call the next method', function () {
            expect(spy).to.be.calledOnce;
        });
    });

    describe('sucess with limitStatement', function () {
        var persistence = mocks.createPersistenceMock({
            loadUsers: {
                error: null,
                result: [1, 2, 3]
            }
        });

        var limitStatement = new LimitStatement(23, 42);
        var route = new UserListRoute(persistence);
        var req = mocks.createRequestMock({
            strichliste: {orderStatement: null, limitStatement: limitStatement}
        });
        var res = mocks.createResponseMock();

        var spy = sinon.spy();
        route.route(req, res, spy);
        var result = req.strichliste.result;

        it('should call the loadUserMethod', function () {
            expect(persistence.loadUsers).to.be.calledTwice;
        });

        it('should call the loadUserMethod with the correct parameters', function () {
            expect(persistence.loadUsers).to.be.calledWith(limitStatement, null);
        });

        it('should return the userlist from the persistence', function () {
            expect(result.content()).to.deep.equal({
                entries: [1, 2, 3],
                limit: 23,
                offset: 42,
                overallCount: 3
            });
        });

        it('should set the correct content type', function () {
            expect(result.contentType()).to.equal('application/json');
        });

        it('should set the correct status code', function () {
            expect(result.statusCode()).to.equal(200);
        });

        it('should call the next method', function () {
            expect(spy).to.be.calledOnce;
        });
    });

    describe('fail', function () {
        var persistence = mocks.createPersistenceMock({
            loadUsers: {
                error: new Error('caboom'),
                result: null
            }
        });

        var route = new UserListRoute(persistence);
        var req = mocks.createRequestMock();
        var res = mocks.createResponseMock();

        var error;
        route.route(req, res, function (_error) {
            error = _error;
        });

        it('should call the loadUserMethod', function () {
            expect(persistence.loadUsers).to.be.calledOnce;
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