'use strict';

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/
var proxy = require("../lib/proxy");
var http = require('http');
var fb_res = require("../_tmp/facebook-res");
var twitter_res = require("../_tmp/twitter-res");


exports.request_test = {
    setUp: function(done) {
        // setup here if necessary
        done();
    },
    proxied_request: function(test) {
        test.expect(2);

        var server = http.createServer(function(req, res) {

            test.equal(req.headers["x-proxied-header"], 'added', 'headers should be added to request');

            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });

            res.write('request successfully proxied!');
            res.end();
        }).listen(8080);

        http.request({
            host: 'localhost',
            path: '/request',
            port: 9000
        }, function(response) {
            var data = '';
            response.on('data', function(chunk) {
                data += chunk;
            });
            response.on('end', function() {
                test.equal(data, 'request successfully proxied!', 'request should be received');
                test.done();

                server.close();
            });
        }).end();
    },

    proxied_request_fb: function(test) {
        test.expect(3);

        http.request({
            host: 'localhost',
            path: '/fb/search?q=Liverpool&type=page&limit=10&fields=name&token',
            port: 9000
        }, function(response) {
            var data = '';

            response.on('data', function(chunk) {
                data += chunk;
            });

            response.on('end', function() {
                var res = JSON.parse(data);

                test.equal(res.error.type, fb_res.session_expired.type, 'Facebook session expired type');
                test.equal(res.error.code, fb_res.session_expired.code, 'Facebook session expired code');
                test.equal(res.error.error_subcode, fb_res.session_expired.error_subcode, 'Facebook session expired error_subcode');

                test.done();
            });

        }).end();
    },
    proxied_request_twitter: function(test) {
        test.expect(2);

        http.request({
            host: 'localhost',
            path: '/tw/search?q=Liverpool&page=3&count=5&include_entities=false',
            port: 9000
        }, function(response) {
            var data = '';

            response.on('data', function(chunk) {
                data += chunk;
            });

            response.on('end', function() {
                var res = JSON.parse(data);

                test.equal(res.errors[0].message, twitter_res.message, 'Twitter Timestamp out of bounds message');
                test.equal(res.errors[0].code, twitter_res.code, 'Twitter Timestamp out of bounds code');

                test.done();
            });

        }).end();
    }

};