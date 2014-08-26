var expect = require('chai').expect;

var Persistence = require('../../lib/UserPersistence');
var mocks = require('../util/mocks');

var OrderStatement = require('../../lib/parameters/OrderStatement');
var LimitStatement = require('../../lib/parameters/LimitStatement');

describe('Persistence', function () {
    describe('loadUsers', function () {
        describe('success', function () {
            var db = mocks.createDBMock({
                selectMany: {error: null, result: {foo: 'bar'}}
            });

            var error, result;
            new Persistence(db)
                .loadUsers(null, null, function (_error, _result) {
                    error = _error;
                    result = _result;
                });

            it('should not return an error', function () {
                expect(error).to.be.null;
            });

            it('should return the result', function () {
                expect(result).to.deep.equal({foo: 'bar'});
            });

            it('should execute the correct query', function () {
                expect(db.selectMany.args[0][0]).to.equal('SELECT users.id AS "id", users.name AS "name", coalesce(sum(value),0) AS \"balance\", max(transactions.createDate) AS \"lastTransaction\" FROM users LEFT JOIN transactions ON (transactions.userId = users.id) GROUP BY users.id');
            });

            it('should assign the correct arguments', function () {
                expect(db.selectMany.args[0][1]).to.deep.equal([]);
            });
        });

        describe('success with limit', function () {
            var db = mocks.createDBMock({
                selectMany: {error: null, result: {foo: 'bar'}}
            });

            var error, result;
            new Persistence(db)
                .loadUsers(new LimitStatement(1, 1), null, function (_error, _result) {
                    error = _error;
                    result = _result;
                });

            it('should not return an error', function () {
                expect(error).to.be.null;
            });

            it('should return the result', function () {
                expect(result).to.deep.equal({foo: 'bar'});
            });

            it('should execute the correct query', function () {
                expect(db.selectMany.args[0][0]).to.equal('SELECT users.id AS "id", users.name AS "name", coalesce(sum(value),0) AS \"balance\", max(transactions.createDate) AS \"lastTransaction\" FROM users LEFT JOIN transactions ON (transactions.userId = users.id) GROUP BY users.id LIMIT 1 OFFSET 1');
            });

            it('should assign the correct arguments', function () {
                expect(db.selectMany.args[0][1]).to.deep.equal([]);
            });
        });

        describe('fail', function () {
            var db = mocks.createDBMock({
                selectMany: {error: new Error('Caboom'), result: null}
            });

            var error, result;
            new Persistence(db)
                .loadUsers(null, null, function (_error, _result) {
                    error = _error;
                    result = _result;
                });

            it('should return an error', function () {
                expect(error.message).to.equal('Caboom');
            });

            it('should return no result', function () {
                expect(result).to.be.null;
            });

            it('should execute the correct query', function () {
                expect(db.selectMany.args[0][0]).to.equal('SELECT users.id AS "id", users.name AS "name", coalesce(sum(value),0) AS \"balance\", max(transactions.createDate) AS \"lastTransaction\" FROM users LEFT JOIN transactions ON (transactions.userId = users.id) GROUP BY users.id');
            });

            it('should assign the correct arguments', function () {
                expect(db.selectMany.args[0][1]).to.deep.equal([]);
            });
        });
    });

    describe('loadUserById', function () {
        describe('success', function () {
            var db = mocks.createDBMock({
                selectOne: {error: null, result: {foo: 'bar'}}
            });

            var error, result;
            new Persistence(db)
                .loadUserById(42, function (_error, _result) {
                    error = _error;
                    result = _result;
                });

            it('should not return an error', function () {
                expect(error).to.be.null;
            });

            it('should return the result', function () {
                expect(result).to.deep.equal({foo: 'bar'});
            });

            it('should execute the correct query', function () {
                expect(db.selectOne.args[0][0]).to.equal('SELECT users.id AS "id", users.name AS "name", coalesce(sum(value),0) AS "balance", max(transactions.createDate) AS \"lastTransaction\" FROM users LEFT JOIN transactions ON (transactions.userId = users.id) WHERE (users.id = ?) GROUP BY users.id');
            });

            it('should assign the correct arguments', function () {
                expect(db.selectOne.args[0][1]).to.deep.equal([42]);
            });
        });

        describe('fail', function () {
            var db = mocks.createDBMock({
                selectOne: {error: new Error('Caboom'), result: null}
            });

            var error, result;
            new Persistence(db)
                .loadUserById(42, function (_error, _result) {
                    error = _error;
                    result = _result;
                });

            it('should return an error', function () {
                expect(error.message).to.equal('Caboom');
            });

            it('should return no result', function () {
                expect(result).to.be.null;
            });

            it('should execute the correct query', function () {
                expect(db.selectOne.args[0][0]).to.equal('SELECT users.id AS "id", users.name AS "name", coalesce(sum(value),0) AS "balance", max(transactions.createDate) AS \"lastTransaction\" FROM users LEFT JOIN transactions ON (transactions.userId = users.id) WHERE (users.id = ?) GROUP BY users.id');
            });

            it('should assign the correct arguments', function () {
                expect(db.selectOne.args[0][1]).to.deep.equal([42]);
            });
        });
    });

    describe('loadUserByName', function () {
        describe('success', function () {
            var db = mocks.createDBMock({
                selectOne: {error: null, result: {name: 'bert'}}
            });

            var error, result;
            new Persistence(db)
                .loadUserByName('bert', function (_error, _result) {
                    error = _error;
                    result = _result;
                });

            it('should not return an error', function () {
                expect(error).to.be.null;
            });

            it('should return the result', function () {
                expect(result).to.deep.equal({name: 'bert'});
            });

            it('should execute the correct query', function () {
                expect(db.selectOne.args[0][0]).to.equal('SELECT users.id AS \"id\", users.name AS \"name\", coalesce(sum(value),0) AS \"balance\", max(transactions.createDate) AS \"lastTransaction\" FROM users LEFT JOIN transactions ON (transactions.userId = users.id) WHERE (lower(users.name) = ?) GROUP BY users.id');
            });

            it('should assign the correct arguments', function () {
                expect(db.selectOne.args[0][1]).to.deep.equal(['bert']);
            });
        });

        describe('fail', function () {
            var db = mocks.createDBMock({
                selectOne: {error: new Error('Caboom'), result: null}
            });

            var error, result;
            new Persistence(db)
                .loadUserByName('bert', function (_error, _result) {
                    error = _error;
                    result = _result;
                });

            it('should return an error', function () {
                expect(error.message).to.equal('Caboom');
            });

            it('should return no result', function () {
                expect(result).to.be.null;
            });

            it('should execute the correct query', function () {
                expect(db.selectOne.args[0][0]).to.equal('SELECT users.id AS \"id\", users.name AS \"name\", coalesce(sum(value),0) AS \"balance\", max(transactions.createDate) AS \"lastTransaction\" FROM users LEFT JOIN transactions ON (transactions.userId = users.id) WHERE (lower(users.name) = ?) GROUP BY users.id');
            });

            it('should assign the correct arguments', function () {
                expect(db.selectOne.args[0][1]).to.deep.equal(['bert']);
            });
        });
    });

    describe('createUser', function () {
        describe('success', function () {
            var db = mocks.createDBMock({
                query: {error: null, result: {lastID: 42}}
            });

            var error, result;
            new Persistence(db)
                .createUser('bert', function (_error, _result) {
                    error = _error;
                    result = _result;
                });

            it('should not return an error', function () {
                expect(error).to.be.null;
            });

            it('should return the result', function () {
                expect(result).to.deep.equal(42);
            });

            it('should execute the correct query', function () {
                expect(db.query.args[0][0]).to.equal("INSERT INTO users (name) VALUES (?)");
            });

            it('should assign the correct arguments', function () {
                expect(db.query.args[0][1]).to.deep.equal(['bert']);
            });
        });

        describe('fail', function () {
            var db = mocks.createDBMock({
                query: {error: new Error('Caboom'), result: null}
            });

            var error, result;
            new Persistence(db)
                .createUser('bert', function (_error, _result) {
                    error = _error;
                    result = _result;
                });

            it('should return an error', function () {
                expect(error.message).to.equal('Caboom');
            });

            it('should return no result', function () {
                expect(result).to.be.null;
            });

            it('should execute the correct query', function () {
                expect(db.query.args[0][0]).to.equal("INSERT INTO users (name) VALUES (?)");
            });

            it('should assign the correct arguments', function () {
                expect(db.query.args[0][1]).to.deep.equal(['bert']);
            });
        });
    });

    describe('createTransaction', function () {
        describe('success', function () {
            var db = mocks.createDBMock({
                query: {error: null, result: {lastID: 42}}
            });

            var error, result;
            new Persistence(db)
                .createTransaction(42, 1337, function (_error, _result) {
                    error = _error;
                    result = _result;
                });

            it('should not return an error', function () {
                expect(error).to.be.null;
            });

            it('should return the result', function () {
                expect(result).to.deep.equal(42);
            });

            it('should execute the correct query', function () {
                expect(db.query.args[0][0]).to.equal("INSERT INTO transactions (userId, value) VALUES (?, ?)");
            });

            it('should assign the correct arguments', function () {
                expect(db.query.args[0][1]).to.deep.equal([42, 1337]);
            });
        });

        describe('fail', function () {
            var db = mocks.createDBMock({
                query: {error: new Error('Caboom'), result: null}
            });

            var error, result;
            new Persistence(db)
                .createTransaction(42, 1337, function (_error, _result) {
                    error = _error;
                    result = _result;
                });

            it('should return an error', function () {
                expect(error.message).to.equal('Caboom');
            });

            it('should return no result', function () {
                expect(result).to.be.null;
            });

            it('should execute the correct query', function () {
                expect(db.query.args[0][0]).to.equal("INSERT INTO transactions (userId, value) VALUES (?, ?)");
            });

            it('should assign the correct arguments', function () {
                expect(db.query.args[0][1]).to.deep.equal([42, 1337]);
            });
        });
    });

    describe('loadTransaction', function () {
        describe('success', function () {
            var db = mocks.createDBMock({
                selectOne: {error: null, result: {value: 123}}
            });

            var error, result;
            new Persistence(db)
                .loadTransaction(1337, function (_error, _result) {
                    error = _error;
                    result = _result;
                });

            it('should not return an error', function () {
                expect(error).to.be.null;
            });

            it('should return the result', function () {
                expect(result).to.deep.equal({value: 123});
            });

            it('should execute the correct query', function () {
                expect(db.selectOne.args[0][0]).to.equal("SELECT id, userId, createDate, value FROM transactions WHERE (id = ?) ORDER BY id DESC");
            });

            it('should assign the correct arguments', function () {
                expect(db.selectOne.args[0][1]).to.deep.equal([1337]);
            });
        });

        describe('fail', function () {
            var db = mocks.createDBMock({
                selectOne: {error: new Error('Caboom'), result: null}
            });

            var error, result;
            new Persistence(db)
                .loadTransaction(1337, function (_error, _result) {
                    error = _error;
                    result = _result;
                });

            it('should return an error', function () {
                expect(error.message).to.equal('Caboom');
            });

            it('should return no result', function () {
                expect(result).to.be.null;
            });

            it('should execute the correct query', function () {
                expect(db.selectOne.args[0][0]).to.equal("SELECT id, userId, createDate, value FROM transactions WHERE (id = ?) ORDER BY id DESC");
            });

            it('should assign the correct arguments', function () {
                expect(db.selectOne.args[0][1]).to.deep.equal([1337]);
            });
        });
    });

    describe('loadTransactionsByUserId', function () {
        describe('success', function () {
            var db = mocks.createDBMock({
                selectMany: {error: null, result: {value: 123}}
            });

            var error, result;
            new Persistence(db)
                .loadTransactionsByUserId(1337, new LimitStatement(1, 2), null, function (_error, _result) {
                    error = _error;
                    result = _result;
                });

            it('should not return an error', function () {
                expect(error).to.be.null;
            });

            it('should return the result', function () {
                expect(result).to.deep.equal({value: 123});
            });

            it('should execute the correct query', function () {
                expect(db.selectMany.args[0][0]).to.equal("SELECT id, userId, createDate, value FROM transactions WHERE (userId = ?) ORDER BY id DESC LIMIT 1 OFFSET 2");
            });

            it('should assign the correct arguments', function () {
                expect(db.selectMany.args[0][1]).to.deep.equal([1337]);
            });
        });

        describe('success without offset/limit', function () {
            var db = mocks.createDBMock({
                selectMany: {error: null, result: {value: 123}}
            });

            var error, result;
            new Persistence(db)
                .loadTransactionsByUserId(1337, null, null, function (_error, _result) {
                    error = _error;
                    result = _result;
                });

            it('should not return an error', function () {
                expect(error).to.be.null;
            });

            it('should return the result', function () {
                expect(result).to.deep.equal({value: 123});
            });

            it('should execute the correct query', function () {
                expect(db.selectMany.args[0][0]).to.equal("SELECT id, userId, createDate, value FROM transactions WHERE (userId = ?) ORDER BY id DESC");
            });

            it('should assign the correct arguments', function () {
                expect(db.selectMany.args[0][1]).to.deep.equal([1337]);
            });
        });

        describe('success without offset/limit', function () {
            var db = mocks.createDBMock({
                selectMany: {error: null, result: {value: 123}}
            });

            var error, result;
            new Persistence(db)
                .loadTransactionsByUserId(1337, new LimitStatement(11, 10), null, function (_error, _result) {
                    error = _error;
                    result = _result;
                });

            it('should not return an error', function () {
                expect(error).to.be.null;
            });

            it('should return the result', function () {
                expect(result).to.deep.equal({value: 123});
            });

            it('should execute the correct query', function () {
                expect(db.selectMany.args[0][0]).to.equal("SELECT id, userId, createDate, value FROM transactions WHERE (userId = ?) ORDER BY id DESC LIMIT 11 OFFSET 10");
            });

            it('should assign the correct arguments', function () {
                expect(db.selectMany.args[0][1]).to.deep.equal([1337]);
            });
        });

        describe('fail', function () {
            var db = mocks.createDBMock({
                selectMany: {error: new Error('Caboom'), result: null}
            });

            var error, result;
            new Persistence(db)
                .loadTransactionsByUserId(1337, new LimitStatement(1, 2), null, function (_error, _result) {
                    error = _error;
                    result = _result;
                });

            it('should return an error', function () {
                expect(error.message).to.equal('Caboom');
            });

            it('should return no result', function () {
                expect(result).to.be.null;
            });

            it('should execute the correct query', function () {
                expect(db.selectMany.args[0][0]).to.equal("SELECT id, userId, createDate, value FROM transactions WHERE (userId = ?) ORDER BY id DESC LIMIT 1 OFFSET 2");
            });

            it('should assign the correct arguments', function () {
                expect(db.selectMany.args[0][1]).to.deep.equal([1337]);
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
                    .loadMetrics(function (_error, _result) {
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
                expect(db.selectMany).to.be.calledWith('select date(createDate) as date, count(*) as overallNumber,count(distinct userid) as distinctUsers,sum(value) as dayBalance,sum(max(value, 0)) as dayBalancePositive,sum(min(value, 0)) as dayBalanceNegative from transactions where createDate >=  date("now", "-30 day") group by date(createDate);');
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
                    result: {balls: 'eggs'}
                }
            });

            var error, result;
            before(function (done) {
                new Persistence(db)
                    .loadMetrics(function (_error, _result) {
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
                expect(db.selectMany).to.be.calledWith('select date(createDate) as date, count(*) as overallNumber,count(distinct userid) as distinctUsers,sum(value) as dayBalance,sum(max(value, 0)) as dayBalancePositive,sum(min(value, 0)) as dayBalanceNegative from transactions where createDate >=  date("now", "-30 day") group by date(createDate);');
            });
        });
    })
});