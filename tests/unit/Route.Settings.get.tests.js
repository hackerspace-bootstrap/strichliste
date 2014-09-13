var expect = require('chai').use(require('sinon-chai')).expect;
var sinon = require('sinon');

var SettingsRoute = require('../../lib/routes/Settings.get');
var mocks = require('../util/mocks');

describe('userListRoute', function () {
    describe('sucess', function () {
        var route = new SettingsRoute({boundaries: {account: {upper: 42, lower: -42}}});
        var req = mocks.createRequestMock();
        var res = mocks.createResponseMock();

        var spy = sinon.spy();
        route.route(req, res, spy);
        var result = req.strichliste.result;

        it('should set the correct content type', function () {
            expect(result.content()).to.deep.equal({boundaries: {upper: 42, lower: -42}});
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
});