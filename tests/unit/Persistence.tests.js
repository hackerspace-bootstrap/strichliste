var expect = require('chai').use(require('sinon-chai')).expect;

var Persistence = require('../../lib/Persistence');
var mocks = require('../util/mocks');

var OrderStatement = require('../../lib/parameters/OrderStatement');
var LimitStatement = require('../../lib/parameters/LimitStatement');

describe('Persistence', function () {
    var expectedBaseStatementForLoadUsersWithoutGroupBy = 'SELECT users.id AS "id", users.name AS "name", coalesce(sum(value),0) AS "balance", max(transactions.createDate) AS "lastTransaction", count(transactions.createDate) AS "countOfTransactions", sum(min(1, max(-transactions.value, 0))) AS "weightedCountOfPurchases", count(distinct substr(transactions.createDate, 0, 11)) AS "activeDays" FROM users LEFT JOIN transactions ON (transactions.userId = users.id)';
    var expectedBaseStatementForLoadUsers = expectedBaseStatementForLoadUsersWithoutGroupBy + ' GROUP BY users.id';

    describe('loadUsers', function () {
        describe('success', function () {
            var db = mocks.createDBMock({
                selectMany: {error: null, result: {foo: 'bar'}}
            });

            var error, result;
            before(function (done) {
                new Persistence(db)
                    .loadUsers(null, null, function (_error, _result) {
                        error = _error;
                        result = _result;
                        done();
                    });
            });

            it('should not return an error', function () {
                expect(error).to.be.null;
            });

            it('should return the result', function () {
                expect(result).to.deep.equal({foo: 'bar'});
            });

            it('should execute the correct query', function () {
                expect(db.selectMany).to.be.calledWith(expectedBaseStatementForLoadUsers, []);
            });
        });

        describe('success with limit', function () {
            var db = mocks.createDBMock({
                selectMany: {error: null, result: {foo: 'bar'}}
            });

            var error, result;
            before(function (done) {
                new Persistence(db)
                    .loadUsers(new LimitStatement(1, 1), null, function (_error, _result) {
                        error = _error;
                        result = _result;
                        done();
                    });
            });

            it('should not return an error', function () {
                expect(error).to.be.null;
            });

            it('should return the result', function () {
                expect(result).to.deep.equal({foo: 'bar'});
            });

            it('should execute the correct query', function () {
                expect(db.selectMany).to.be.calledWith(expectedBaseStatementForLoadUsers + ' LIMIT 1 OFFSET 1', []);
            });
        });

        describe('fail', function () {
            var db = mocks.createDBMock({
                selectMany: {error: new Error('Caboom'), result: null}
            });

            var error, result;
            before(function (done) {
                new Persistence(db)
                    .loadUsers(null, null, function (_error, _result) {
                        error = _error;
                        result = _result;
                        done();
                    });
            });

            it('should return an error', function () {
                expect(error.message).to.equal('Caboom');
            });

            it('should return no result', function () {
                expect(result).to.be.null;
            });

            it('should execute the correct query', function () {
                expect(db.selectMany).to.be.calledWith(expectedBaseStatementForLoadUsers, []);
            });
        });
    });

    describe('loadUserById', function () {
        describe('success', function () {
            var db = mocks.createDBMock({
                selectOne: {error: null, result: {foo: 'bar'}}
            });

            var error, result;
            before(function (done) {
                new Persistence(db)
                    .loadUserById(42, function (_error, _result) {
                        error = _error;
                        result = _result;
                        done();
                    });
            });

            it('should not return an error', function () {
                expect(error).to.be.null;
            });

            it('should return the result', function () {
                expect(result).to.deep.equal({foo: 'bar'});
            });

            it('should execute the correct query', function () {
                expect(db.selectOne).to.be.calledWith(expectedBaseStatementForLoadUsersWithoutGroupBy + ' WHERE (users.id = ?) GROUP BY users.id', [42]);
            });
        });

        describe('fail', function () {
            var db = mocks.createDBMock({
                selectOne: {error: new Error('Caboom'), result: null}
            });

            var error, result;
            before(function (done) {
                new Persistence(db)
                    .loadUserById(42, function (_error, _result) {
                        error = _error;
                        result = _result;
                        done();
                    });
            });

            it('should return an error', function () {
                expect(error.message).to.equal('Caboom');
            });

            it('should return no result', function () {
                expect(result).to.be.null;
            });

            it('should execute the correct query', function () {
                expect(db.selectOne).to.be.calledWith(expectedBaseStatementForLoadUsersWithoutGroupBy + ' WHERE (users.id = ?) GROUP BY users.id', [42]);
            });
        });
    });

    describe('loadUserByName', function () {
        describe('success', function () {
            var db = mocks.createDBMock({
                selectOne: {error: null, result: {name: 'bert'}}
            });

            var error, result;
            before(function (done) {
                new Persistence(db)
                    .loadUserByName('bert', function (_error, _result) {
                        error = _error;
                        result = _result;
                        done();
                    });
            });

            it('should not return an error', function () {
                expect(error).to.be.null;
            });

            it('should return the result', function () {
                expect(result).to.deep.equal({name: 'bert'});
            });

            it('should execute the correct query', function () {
                expect(db.selectOne).to.be.calledWith(expectedBaseStatementForLoadUsersWithoutGroupBy + ' WHERE (lower(users.name) = ?) GROUP BY users.id', ['bert']);
            });
        });

        describe('fail', function () {
            var db = mocks.createDBMock({
                selectOne: {error: new Error('Caboom'), result: null}
            });

            var error, result;
            before(function (done) {
                new Persistence(db)
                    .loadUserByName('bert', function (_error, _result) {
                        error = _error;
                        result = _result;
                        done();
                    });
            });

            it('should return an error', function () {
                expect(error.message).to.equal('Caboom');
            });

            it('should return no result', function () {
                expect(result).to.be.null;
            });

            it('should execute the correct query', function () {
                expect(db.selectOne).to.be.calledWith(expectedBaseStatementForLoadUsersWithoutGroupBy + ' WHERE (lower(users.name) = ?) GROUP BY users.id', ['bert']);
            });
        });
    });

    describe('createUser', function () {
        describe('success', function () {
            var db = mocks.createDBMock({
                query: {error: null, result: {lastID: 42}}
            });

            var error, result;
            before(function (done) {
                new Persistence(db)
                    .createUser('bert', function (_error, _result) {
                        error = _error;
                        result = _result;
                        done();
                    });
            });

            it('should not return an error', function () {
                expect(error).to.be.null;
            });

            it('should return the result', function () {
                expect(result).to.deep.equal(42);
            });

            it('should execute the correct query', function () {
                expect(db.query).to.be.calledWith('INSERT INTO users (name) VALUES (?)', ['bert']);
            });
        });

        describe('fail', function () {
            var db = mocks.createDBMock({
                query: {error: new Error('Caboom'), result: null}
            });

            var error, result;
            before(function (done) {
                new Persistence(db)
                    .createUser('bert', function (_error, _result) {
                        error = _error;
                        result = _result;
                        done();
                    });
            });

            it('should return an error', function () {
                expect(error.message).to.equal('Caboom');
            });

            it('should return no result', function () {
                expect(result).to.be.null;
            });

            it('should execute the correct query', function () {
                expect(db.query).to.be.calledWith('INSERT INTO users (name) VALUES (?)', ['bert']);
            });
        });
    });

    describe('createTransaction', function () {
        describe('success', function () {
            var db = mocks.createDBMock({
                query: {error: null, result: {lastID: 42}}
            });

            var error, result;
            before(function (done) {
                new Persistence(db)
                    .createTransaction(42, 1337, null, function (_error, _result) {
                        error = _error;
                        result = _result;
                        done();
                    });
            });

            it('should not return an error', function () {
                expect(error).to.be.null;
            });

            it('should return the result', function () {
                expect(result).to.deep.equal(42);
            });

            it('should execute the correct query', function () {
                expect(db.query).to.be.calledWith("INSERT INTO transactions (userId, value, comment) VALUES (?, ?, ?)", [42, 1337, null]);
            });
        });

        describe('success with comment', function () {
            var db = mocks.createDBMock({
                query: {error: null, result: {lastID: 42}}
            });

            var error, result;
            before(function (done) {
                new Persistence(db)
                    .createTransaction(42, 1337, "abc", function (_error, _result) {
                        error = _error;
                        result = _result;
                        done();
                    });
            });

            it('should not return an error', function () {
                expect(error).to.be.null;
            });

            it('should return the result', function () {
                expect(result).to.deep.equal(42);
            });

            it('should execute the correct query', function () {
                expect(db.query).to.be.calledWith("INSERT INTO transactions (userId, value, comment) VALUES (?, ?, ?)", [42, 1337, "abc"]);
            });
        });

        describe('fail', function () {
            var db = mocks.createDBMock({
                query: {error: new Error('Caboom'), result: null}
            });

            var error, result;
            before(function (done) {
                new Persistence(db)
                    .createTransaction(42, 1337, null, function (_error, _result) {
                        error = _error;
                        result = _result;
                        done();
                    });
            });

            it('should return an error', function () {
                expect(error.message).to.equal('Caboom');
            });

            it('should return no result', function () {
                expect(result).to.be.null;
            });

            it('should execute the correct query', function () {
                expect(db.query).to.be.calledWith("INSERT INTO transactions (userId, value, comment) VALUES (?, ?, ?)", [42, 1337, null]);
            });
        });
    });

    describe('loadTransaction', function () {
        describe('success', function () {
            var db = mocks.createDBMock({
                selectOne: {error: null, result: {value: 123}}
            });

            var error, result;
            before(function (done) {
                new Persistence(db)
                    .loadTransaction(1337, function (_error, _result) {
                        error = _error;
                        result = _result;
                        done();
                    });
            });

            it('should not return an error', function () {
                expect(error).to.be.null;
            });

            it('should return the result', function () {
                expect(result).to.deep.equal({value: 123});
            });

            it('should execute the correct query', function () {
                expect(db.selectOne).to.be.calledWith("SELECT id, userId, createDate, value, comment FROM transactions WHERE (id = ?) ORDER BY id DESC", [1337]);
            });
        });

        describe('fail', function () {
            var db = mocks.createDBMock({
                selectOne: {error: new Error('Caboom'), result: null}
            });

            var error, result;
            before(function (done) {
                new Persistence(db)
                    .loadTransaction(1337, function (_error, _result) {
                        error = _error;
                        result = _result;
                        done();
                    });
            });

            it('should return an error', function () {
                expect(error.message).to.equal('Caboom');
            });

            it('should return no result', function () {
                expect(result).to.be.null;
            });

            it('should execute the correct query', function () {
                expect(db.selectOne).to.be.calledWith("SELECT id, userId, createDate, value, comment FROM transactions WHERE (id = ?) ORDER BY id DESC", [1337]);
            });
        });
    });

    describe('loadTransactions', function () {
        describe('success', function () {
            var db = mocks.createDBMock({
                selectMany: {error: null, result: {value: 123}}
            });

            var error, result;
            before(function (done) {
                new Persistence(db)
                    .loadTransactions(new LimitStatement(1, 2), null, function (_error, _result) {
                        error = _error;
                        result = _result;
                        done();
                    });
            });

            it('should not return an error', function () {
                expect(error).to.be.null;
            });

            it('should return the result', function () {
                expect(result).to.deep.equal({value: 123});
            });

            it('should execute the correct query', function () {
                expect(db.selectMany).to.be.calledWith("SELECT id, userId, createDate, value, comment FROM transactions ORDER BY id DESC LIMIT 1 OFFSET 2", []);
            });
        });

        describe('success without offset/limit', function () {
            var db = mocks.createDBMock({
                selectMany: {error: null, result: {value: 123}}
            });

            var error, result;
            before(function (done) {
                new Persistence(db)
                    .loadTransactions(null, null, function (_error, _result) {
                        error = _error;
                        result = _result;
                        done();
                    });
            });

            it('should not return an error', function () {
                expect(error).to.be.null;
            });

            it('should return the result', function () {
                expect(result).to.deep.equal({value: 123});
            });

            it('should execute the correct query', function () {
                expect(db.selectMany).to.be.calledWith("SELECT id, userId, createDate, value, comment FROM transactions ORDER BY id DESC", []);
            });
        });

        describe('success without offset/limit', function () {
            var db = mocks.createDBMock({
                selectMany: {error: null, result: {value: 123}}
            });

            var error, result;
            before(function (done) {
                new Persistence(db)
                    .loadTransactions(new LimitStatement(11, 10), null, function (_error, _result) {
                        error = _error;
                        result = _result;
                        done();
                    });
            });

            it('should not return an error', function () {
                expect(error).to.be.null;
            });

            it('should return the result', function () {
                expect(result).to.deep.equal({value: 123});
            });

            it('should execute the correct query', function () {
                expect(db.selectMany).to.be.calledWith("SELECT id, userId, createDate, value, comment FROM transactions ORDER BY id DESC LIMIT 11 OFFSET 10", []);
            });
        });

        describe('fail', function () {
            var db = mocks.createDBMock({
                selectMany: {error: new Error('Caboom'), result: null}
            });

            var error, result;
            before(function (done) {
                new Persistence(db)
                    .loadTransactions(new LimitStatement(1, 2), null, function (_error, _result) {
                        error = _error;
                        result = _result;
                        done();
                    });
            });

            it('should return an error', function () {
                expect(error.message).to.equal('Caboom');
            });

            it('should return no result', function () {
                expect(result).to.be.null;
            });

            it('should execute the correct query', function () {
                expect(db.selectMany).to.be.calledWith("SELECT id, userId, createDate, value, comment FROM transactions ORDER BY id DESC LIMIT 1 OFFSET 2", []);
            });
        });
    });

    describe('loadTransactionsByUserId', function () {
        describe('success', function () {
            var db = mocks.createDBMock({
                selectMany: {error: null, result: {value: 123}}
            });

            var error, result;
            before(function (done) {
                new Persistence(db)
                    .loadTransactionsByUserId(1337, new LimitStatement(1, 2), null, function (_error, _result) {
                        error = _error;
                        result = _result;
                        done();
                    });
            });

            it('should not return an error', function () {
                expect(error).to.be.null;
            });

            it('should return the result', function () {
                expect(result).to.deep.equal({value: 123});
            });

            it('should execute the correct query', function () {
                expect(db.selectMany).to.be.calledWith("SELECT id, userId, createDate, value, comment FROM transactions WHERE (userId = ?) ORDER BY id DESC LIMIT 1 OFFSET 2", [1337]);
            });
        });

        describe('success without offset/limit', function () {
            var db = mocks.createDBMock({
                selectMany: {error: null, result: {value: 123}}
            });

            var error, result;
            before(function (done) {
                new Persistence(db)
                    .loadTransactionsByUserId(1337, null, null, function (_error, _result) {
                        error = _error;
                        result = _result;
                        done();
                    });
            });

            it('should not return an error', function () {
                expect(error).to.be.null;
            });

            it('should return the result', function () {
                expect(result).to.deep.equal({value: 123});
            });

            it('should execute the correct query', function () {
                expect(db.selectMany).to.be.calledWith("SELECT id, userId, createDate, value, comment FROM transactions WHERE (userId = ?) ORDER BY id DESC", [1337]);
            });
        });

        describe('success without offset/limit', function () {
            var db = mocks.createDBMock({
                selectMany: {error: null, result: {value: 123}}
            });

            var error, result;
            before(function (done) {
                new Persistence(db)
                    .loadTransactionsByUserId(1337, new LimitStatement(11, 10), null, function (_error, _result) {
                        error = _error;
                        result = _result;
                        done();
                    });
            });

            it('should not return an error', function () {
                expect(error).to.be.null;
            });

            it('should return the result', function () {
                expect(result).to.deep.equal({value: 123});
            });

            it('should execute the correct query', function () {
                expect(db.selectMany).to.be.calledWith("SELECT id, userId, createDate, value, comment FROM transactions WHERE (userId = ?) ORDER BY id DESC LIMIT 11 OFFSET 10", [1337]);
            });
        });

        describe('fail', function () {
            var db = mocks.createDBMock({
                selectMany: {error: new Error('Caboom'), result: null}
            });

            var error, result;
            before(function (done) {
                new Persistence(db)
                    .loadTransactionsByUserId(1337, new LimitStatement(1, 2), null, function (_error, _result) {
                        error = _error;
                        result = _result;
                        done();
                    });
            });

            it('should return an error', function () {
                expect(error.message).to.equal('Caboom');
            });

            it('should return no result', function () {
                expect(result).to.be.null;
            });

            it('should execute the correct query', function () {
                expect(db.selectMany).to.be.calledWith("SELECT id, userId, createDate, value, comment FROM transactions WHERE (userId = ?) ORDER BY id DESC LIMIT 1 OFFSET 2", [1337]);
            });
        });
    });

    describe('loadMetrics', function () {
        describe('success', function () {
            var db = mocks.createDBMock({
                selectOne: {
                    error: [null, null, null, null],
                    result: [
                        {foo: 'bar'},
                        {boo: 'far'},
                        {spam: 'eggs'},
                        {baz: 'ball'}
                    ]
                },
                selectMany: {
                    error: null,
                    result: {balls: 'eggs'}
                }
            });

            var error, result;
            before(function (done) {
                new Persistence(db)
                    .loadMetrics('2014-01-01', function (_error, _result) {
                        error = _error;
                        result = _result;
                        done();
                    });
            });

            it('should not return an error', function () {
                expect(error).to.be.null;
            });

            it('should return the result', function () {
                expect(result).to.deep.equal({
                    foo: 'bar',
                    boo: 'far',
                    spam: 'eggs',
                    baz: 'ball',
                    days: {
                        balls: 'eggs'
                    }
                });
            });

            it('should execute the correct queries', function () {
                expect(db.selectOne).to.be.calledWith('select count(*) as countTransactions from transactions', []);
                expect(db.selectOne).to.be.calledWith('select sum(value) as overallBalance from transactions', []);
                expect(db.selectOne).to.be.calledWith('select count(*) as countUsers from users', []);
                expect(db.selectOne).to.be.calledWith('select avg(userBalance) as avgBalance from (select sum(value) as userBalance from transactions group by userId) as ghoti', []);
                expect(db.selectMany).to.be.calledWith('select date(createDate) as date, count(*) as overallNumber, count(distinct userid) as distinctUsers, sum(value) as dayBalance, sum(max(value, 0)) as dayBalancePositive, sum(min(value, 0)) as dayBalanceNegative from transactions where createDate >= ? group by date(createDate);', ['2014-01-01']);
            });
        });

        describe('fail', function () {
            var e = new Error('caboomsl!');
            var db = mocks.createDBMock({
                selectOne: {
                    error: [null, null, e, null],
                    result: [
                        {foo: 'bar'},
                        {spam: 'eggs'},
                        null,
                        {baz: 'ball'}
                    ]
                },
                selectMany: {
                    error: null,
                    result: {balls: 'eggs', days: []}
                }
            });

            var error, result;
            before(function (done) {
                new Persistence(db)
                    .loadMetrics('2014-01-01', function (_error, _result) {
                        error = _error;
                        result = _result;
                        done();
                    });
            });

            it('should not return an error', function () {
                expect(error).to.equal(e);
            });

            it('should return the result', function () {
                expect(result).to.be.null;
            });

            it('should query several times', function () {
                expect(db.selectOne).to.be.callCount(4);
            });

            it('should not query', function () {
                expect(db.selectMany).to.be.calledOnce;
            });

            it('should execute the correct queries', function () {
                expect(db.selectOne).to.be.calledWith('select count(*) as countTransactions from transactions', []);
                expect(db.selectOne).to.be.calledWith('select sum(value) as overallBalance from transactions', []);
                expect(db.selectOne).to.be.calledWith('select count(*) as countUsers from users', []);
                expect(db.selectOne).to.be.calledWith('select avg(userBalance) as avgBalance from (select sum(value) as userBalance from transactions group by userId) as ghoti', []);
                expect(db.selectMany).to.be.calledWith('select date(createDate) as date, count(*) as overallNumber, count(distinct userid) as distinctUsers, sum(value) as dayBalance, sum(max(value, 0)) as dayBalancePositive, sum(min(value, 0)) as dayBalanceNegative from transactions where createDate >= ? group by date(createDate);', ['2014-01-01']);
            });
        });
    })
});
