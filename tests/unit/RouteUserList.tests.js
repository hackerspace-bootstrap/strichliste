var expect = require('chai').expect;

var UserListRoute = require('../../lib/routes/UserList');
var mocks = require('../util/mocks');

describe('userListRoute', function() {
    describe('sucess', function() {
        var userLoader = mocks.createUserPersistenceMock({
            loadUsers: {
                error: null,
                result: [1,2,3]
            }
        });

        var route = new UserListRoute(userLoader);
        var req = mocks.createRequestMock();
        var res = mocks.createResponseMock();

        it('should return the userlist from the userLoader', function() {
            route.route(req, res, function() {
                expect(false).to.be.true;
            });

            expect(res._end).to.equal('[1,2,3]');
        });
    });

    describe('fail', function() {
        var userLoader = mocks.createUserPersistenceMock({
            loadUsers: {
                error: new Error('caboom'),
                result: null
            }
        });

        var route = new UserListRoute(userLoader);
        var req = mocks.createRequestMock();
        var res = mocks.createResponseMock();

        it('should call next with an eror', function() {
            route.route(req, res, function(error) {
                expect(error.errorCode).to.equal(500);
                expect(error.message).to.equal('caboom');
            });

            expect(res._end).to.be.null;
        });
    });
});