var expect = require('chai').expect;
var request = require('supertest');
var express = require('express');

var appFactory = require('../../appFactory');
var configuration = require('../../lib/configuration');

describe('Integration tests', function () {
    var app;
    before(function (done) {
        appFactory.create(function (error, _app) {
            app = _app;
            done();
        });
    });

    it('should return the app settings', function (done) {
        request(app)
            .get('/settings')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('{"boundaries":{"upper":42,"lower":-23}}', done);
    });

    it('should return an empty list', function (done) {
        request(app)
            .get('/user')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('[]', done);
    });

    it('should create a user', function (done) {
        request(app)
            .post('/user')
            .send({name: 'bert'})
            .expect('Content-Type', /application\/json/)
            .expect(201)
            .expect('{"id":1,"name":"bert","balance":0,"lastTransaction":null}', done);
    });

    it('should return a list with one entry', function (done) {
        request(app)
            .get('/user')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('[{"id":1,"name":"bert","balance":0,"lastTransaction":null}]', done);
    });

    it('should return a empty list b/c of limit+offset', function (done) {
        request(app)
            .get('/user?offset=1&limit=1')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('[]', done);
    });

    it('create should fail without a name', function (done) {
        request(app)
            .post('/user')
            .expect('Content-Type', /application\/json/)
            .expect(400)
            .expect('{"message":"name missing"}', done);
    });

    it('create should fail when the name already exists', function (done) {
        request(app)
            .post('/user')
            .send({name: 'bert'})
            .expect('Content-Type', /application\/json/)
            .expect(409)
            .expect('{"message":"user bert already exists"}', done);
    });

    it('should load a user by id', function (done) {
        request(app)
            .get('/user/1')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('{"id":1,"name":"bert","balance":0,"lastTransaction":null,"transactions":[]}', done);
    });

    it('should return a failure when user does not exist', function (done) {
        request(app)
            .get('/user/10')
            .expect('Content-Type', /application\/json/)
            .expect(404)
            .expect('{"message":"user 10 not found"}', done);
    });

    it('should return a empty list of transactions', function (done) {
        request(app)
            .get('/user/1/transaction')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('{"overallCount":0,"limit":null,"offset":null,"entries":[]}', done);
    });

    it('transaction create should fail when value is not a number', function (done) {
        request(app)
            .post('/user/1/transaction')
            .send({value: 'foo'})
            .expect('Content-Type', /application\/json/)
            .expect(400)
            .expect('{"message":"not a number: foo"}', done);
    });

    it('transaction create should fail when value is zero', function (done) {
        request(app)
            .post('/user/1/transaction')
            .send({value: 0})
            .expect('Content-Type', /application\/json/)
            .expect(400)
            .expect('{"message":"value must not be zero"}', done);
    });

    it('should create a transaction', function (done) {
        request(app)
            .post('/user/1/transaction')
            .send({value: 11})
            .expect('Content-Type', /application\/json/)
            .expect(201)
            .expect(/{"id":1,"userId":1,"createDate":"(.*)","value":11}/, done);
    });

    it('should load the list of transactions', function (done) {
        request(app)
            .get('/user/1/transaction')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect(/\[{"id":1,"userId":1,"createDate":"(.*)","value":11}\]/, done);
    });

    it('should load a single transaction', function (done) {
        request(app)
            .get('/user/1/transaction/1')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect(/{"id":1,"userId":1,"createDate":"(.*)","value":11}/, done);
    });

    it('should create a second transaction', function (done) {
        request(app)
            .post('/user/1/transaction')
            .send({value: 11})
            .expect('Content-Type', /application\/json/)
            .expect(201)
            .expect(/{"id":2,"userId":1,"createDate":"(.*)","value":11}/, done);
    });

    it('should return the complete list of transactions', function (done) {
        request(app)
            .get('/user/1/transaction')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect(/\[\{"id":2,"userId":1,"createDate":"(.*)","value":11\},\{"id":1,"userId":1,"createDate":"(.*)","value":11\}\]/, done);
    });

    it('should fail the transaction creation with 403 (lower account boundary error)', function (done) {
        request(app)
            .post('/user/1/transaction')
            .send({value: -100})
            .expect('Content-Type', /application\/json/)
            .expect(403)
            .expect('{"message":"transaction value of -100 leads to an overall account balance of -78 which goes below the lower account limit of -23"}', done);
    });

    it('should fail the transaction creation with 403 (upper account boundary error)', function (done) {
        request(app)
            .post('/user/1/transaction')
            .send({value: 100})
            .expect('Content-Type', /application\/json/)
            .expect(403)
            .expect('{"message":"transaction value of 100 leads to an overall account balance of 122 which goes beyond the upper account limit of 42"}', done);
    });

    it('should fail the transaction creation with 403 (upper transaction boundary error)', function (done) {
        request(app)
            .post('/user/1/transaction')
            .send({value: 99999})
            .expect('Content-Type', /application\/json/)
            .expect(403)
            .expect('{"message":"transaction value of 99999 exceeds the transaction maximum of 9999"}', done);
    });

    it('should fail the transaction creation with 403 (lower transaction boundary error)', function (done) {
        request(app)
            .post('/user/1/transaction')
            .send({value: -99999})
            .expect('Content-Type', /application\/json/)
            .expect(403)
            .expect('{"message":"transaction value of -99999 falls below the transaction minimum of -9999"}', done);
    });

    it('should return a restricted list of transactions (limit=1)', function (done) {
        request(app)
            .get('/user/1/transaction?limit=1')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect(/\[\{"id":2,"userId":1,"createDate":"(.*)","value":11\}\]/, done);
    });

    it('should return a restricted list of transactions (offset=1&limit=1)', function (done) {
        request(app)
            .get('/user/1/transaction?limit=1&offset=1')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect(/\[\{"id":1,"userId":1,"createDate":"(.*)","value":11\}\]/, done);
    });
});