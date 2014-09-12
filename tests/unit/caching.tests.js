var expect = require('chai').use(require('sinon-chai')).expect;
var sinon = require('sinon');

var Cache = require('../../lib/caching/Cache');

describe('caching', function() {
    describe('cache set/get', function() {
        var c;

        before(function() {
            c = new Cache();

            c.set('/a/b', null, 'ab');
            c.set('/a/b', 'foobar', 'foobar');
        });

        it('should hold a value', function() {
            expect(c.get('/a/b', null)).to.equal('ab');
        });

        it('should hold a value /w parameters', function() {
            expect(c.get('/a/b', 'foobar')).to.equal('foobar');
        });
    });

    describe('cache /w clear', function() {
        var c;

        before(function() {
            c = new Cache();

            c.set('/a/b', null, 'ab');
            c.set('/a/b', 'foobar', 'foobar');
            c.set('/a/c', null, 'ac');

            c.clear('/a/b');
        });

        it('should have cleared all items from the same route', function() {
            expect(c.get('/a/b', null)).to.be.null;
            expect(c.get('/a/b', 'foobar')).to.be.null;
        });

        it('should have hold on to the other route', function() {
            expect(c.get('/a/c', null)).to.equal('ac');
        });
    });
});