/**
 * Created by krab on 05.04.16.
 */
var request = require('supertest');
var should = require("should");
var http = require('http');
var config = require('../config');

describe('redirect routes test', function () {
    this.timeout(10000);
    var server;

    beforeEach(function () {
        server = require('../server');
    });
    afterEach(function () {
        server.close();
    });

    it('check response time limit', function testTimeLimit(done) {
        //auxiliary server with responce time higher then limit
        var auxiliaryServer = http.createServer(function (req, res) {
            setTimeout( function () {
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end('Test');
            }, config.TIME_LIMIT + 1000);
        });
        auxiliaryServer.listen(3010);
        var reqTime = new Date().getTime();
        
        request(server)
            .get('/?uri=localhost:3010')
            .expect(503)
            .end(function(err, res) {
                var resTime =  new Date().getTime();
                resTime.should.be.approximately(reqTime, config.TIME_LIMIT + 500);
                auxiliaryServer.close();
                done();
           });
    });

    it('check 200 response status', function testCorrectResponse(done) {
        request(server)
            .get('/?uri=ya.ru')
            .expect(200, done);
    });

    it('check 404 response status', function testErrorResponse(done) {
        request(server)
            .get('/a?uri=ya.ru')
            .expect(404, done);
    });

});