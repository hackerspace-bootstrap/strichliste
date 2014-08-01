var request = require('supertest');
var express = require('express');

var appFactory = require('../../appFactory');
var configuration = require('../../lib/configuration');

describe('foo', function() {
    var app;
    before(function(done) {
        appFactory.create(function(error, _app) {
            app = _app;
            done();
        });
    });

    it('should return an empty list', function(done) {
        request(app)
            .get('/user')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('[]', done);
    });

    it('should create a user', function(done) {
        request(app)
            .post('/user')
            .send({name: 'bert'})
            .expect('Content-Type', /application\/json/)
            .expect(201)
            .expect('{"id":1,"name":"bert","balance":0}', done);
    });

    it('should return a list with one entry', function(done) {
        request(app)
            .get('/user')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('[{"id":1,"name":"bert","balance":0}]', done);
    });

    it('create should fail without without a name', function(done) {
        request(app)
            .post('/user')
            .expect('Content-Type', /application\/json/)
            .expect(400)
            .expect('{"message":"name missing"}', done);
    });

    it('create should fail when the name already exists', function(done) {
        request(app)
            .post('/user')
            .send({name: 'bert'})
            .expect('Content-Type', /application\/json/)
            .expect(409)
            .expect('{"message":"user bert already exists"}', done);
    });

    it('should load a user by id', function(done) {
        request(app)
            .get('/user/1')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('{"id":1,"name":"bert","balance":0}', done);
    });

    it('should return a failure when user does not exist', function(done) {
        request(app)
            .get('/user/10')
            .expect('Content-Type', /application\/json/)
            .expect(404)
            .expect('{"message":"user 10 not found"}', done);
    });

    it('should return a empty list of transactions', function(done) {
        request(app)
            .get('/user/1/transaction')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('[]', done);
    });

    it('transaction create should fail when value is not a number', function(done) {
        request(app)
            .post('/user/1/transaction')
            .send({value: 'foo'})
            .expect('Content-Type', /application\/json/)
            .expect(400)
            .expect('{"message":"not a number: foo"}', done);
    });

    it('transaction create should fail when value is zero', function(done) {
        request(app)
            .post('/user/1/transaction')
            .send({value: 0})
            .expect('Content-Type', /application\/json/)
            .expect(400)
            .expect('{"message":"value must not be zero"}', done);
    });

    it('should create a transaction', function(done) {
        request(app)
            .post('/user/1/transaction')
            .send({value: 42})
            .expect('Content-Type', /application\/json/)
            .expect(201)
            .expect(/{"id":1,"userId":1,"createDate":"(.*)","value":42}/, done);
    });

    it('should load the list of transactions', function(done) {
        request(app)
            .get('/user/1/transaction')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect(/\[{"id":1,"userId":1,"createDate":"(.*)","value":42}\]/, done);
    });

    it('should load a single transaction', function(done) {
        request(app)
            .get('/user/1/transaction/1')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect(/{"id":1,"userId":1,"createDate":"(.*)","value":42}/, done);
    });
});