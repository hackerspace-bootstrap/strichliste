var expect = require('chai').expect;
var sinon = require('sinon');

var UserListRoute = require('../../lib/routes/UserList');
var mocks = require('../util/mocks');

describe('userListRoute', function () {
    describe('sucess', function () {
        var userLoader = mocks.createUserPersistenceMock({
            loadUsers: {
                error: null,
                result: [1, 2, 3]
            }
        });

        var route = new UserListRoute(userLoader);
        var req = mocks.createRequestMock();
        var res = mocks.createResponseMock();

        var spy = sinon.spy();
        route.route(req, res, spy);
        var result = req.strichliste.result;

        it('should call the loadUserMethod', function () {
            expect(userLoader.loadUsers.callCount).to.equal(1);
        });

        it('should return the userlist from the userLoader', function () {
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
            loadUsers: {
                error: new Error('caboom'),
                result: null
            }
        });

        var route = new UserListRoute(userLoader);
        var req = mocks.createRequestMock();
        var res = mocks.createResponseMock();

        var error;
        route.route(req, res, function (_error) {
            error = _error;
        });

        it('should call the loadUserMethod', function () {
            expect(userLoader.loadUsers.callCount).to.equal(1);
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