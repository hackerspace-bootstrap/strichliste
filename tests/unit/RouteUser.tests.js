var expect = require('chai').expect;

var UserRoute = require('../../lib/routes/User');
var mocks = require('../util/mocks');

describe('userRoute', function() {
    describe('sucess', function() {
        var userLoader = mocks.createUserPersistenceMock({
            loadUserById: {
                error: null,
                result: {name:'bert'}
            }
        });

        var route = new UserRoute(userLoader);
        var req = mocks.createRequestMock({
            params: {id: 1}
        });
        var res = mocks.createResponseMock();

        it('should return the user from the userLoader', function() {
            route.route(req, res, function() {
                expect(false).to.be.true;
            });

            expect(res._end).to.equal('{"name":"bert"}');
        });
    });

    describe('not found', function() {
        var userLoader = mocks.createUserPersistenceMock({
            loadUserById: {
                error: null,
                result: null
            }
        });

        var route = new UserRoute(userLoader);
        var req = mocks.createRequestMock({
            params: {id: 1}
        });
        var res = mocks.createResponseMock();

        it('should return a not found error', function() {
            route.route(req, res, function(error) {
                expect(error.message).to.equal('user 1 not found');
                expect(error.errorCode).to.equal(404);
            });

            expect(res._end).to.be.null;
        });
    });

    describe('fail', function() {
        var userLoader = mocks.createUserPersistenceMock({
            loadUserById: {
                error: new Error('caboom'),
                result: null
            }
        });

        var route = new UserRoute(userLoader);
        var req = mocks.createRequestMock({
            params: {id: 1}
        });
        var res = mocks.createResponseMock();

        it('should return a an internal server error', function() {
            route.route(req, res, function(error) {
                expect(error.message).to.equal('caboom');
                expect(error.errorCode).to.equal(500);
            });

            expect(res._end).to.be.null;
        });
    });
});