var expect = require('chai').expect;

var Routes = require('../../lib/routing/Routes');
var mocks = require('../util/mocks');

function createRouteMock(path, pred) {
    return {
        mountPoint: function () {
            return {
                path: function () {
                    return path;
                },
                predecessors: function () {
                    return pred || []
                },
                method: function () {
                    return 'get';
                }
            };
        },
        route: {
            bind: function () {
                return 'route to "' + path + '"';
            }
        }
    };
}

describe('Routing', function () {
    it('should bind the correct routes with the correct predecessor', function () {
        var r1 = createRouteMock('fooPath', ['bar']);
        var r2 = createRouteMock('barPath');
        var a = new Routes();

        a.addRoute('foo', r1);
        a.addRoute('bar', r2);

        var appMock = mocks.createAppMock();
        a.mount(appMock);

        expect(appMock.get).to.be.calledWithExactly('fooPath', 'route to "barPath"', 'route to "fooPath"');
        expect(appMock.get).to.be.calledWithExactly('barPath', 'route to "barPath"');
    });

    it('should crash if an invalid predecessor has been specified', function () {
        var r1 = createRouteMock('fooPath', ['caboom!']);
        var a = new Routes();

        a.addRoute('foo', r1);

        var appMock = mocks.createAppMock();

        expect(function () {
            a.mount(appMock);
        }).to.throw(/could not load predecessor: caboom!/);
    });
});