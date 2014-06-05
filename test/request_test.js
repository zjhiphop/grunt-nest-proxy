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
var request = require("request");
var _ = require("lodash");
var gitCfgReader = require("../lib/git-config-reader");


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

    // proxied_request_fb: function(test) {
    //     test.expect(3);

    //     http.request({
    //         host: 'localhost',
    //         path: '/fb/search?q=Liverpool&type=page&limit=10&fields=name&token',
    //         port: 9000
    //     }, function(response) {
    //         var data = '';

    //         response.on('data', function(chunk) {
    //             data += chunk;
    //         });

    //         response.on('end', function() {
    //             var res = JSON.parse(data);

    //             test.equal(res.error.type, fb_res.session_expired.type, 'Facebook session expired type');
    //             test.equal(res.error.code, fb_res.session_expired.code, 'Facebook session expired code');
    //             test.equal(res.error.error_subcode, fb_res.session_expired.error_subcode, 'Facebook session expired error_subcode');

    //             test.done();
    //         });

    //     }).end();
    // },
    // proxied_request_twitter: function(test) {
    //     test.expect(2);

    //     http.request({
    //         host: 'localhost',
    //         path: '/tw/search?q=Liverpool&page=3&count=5&include_entities=false',
    //         port: 9000
    //     }, function(response) {
    //         var data = '';

    //         response.on('data', function(chunk) {
    //             data += chunk;
    //         });

    //         response.on('end', function() {
    //             var res = JSON.parse(data);

    //             test.equal(res.errors[0].message, twitter_res.message, 'Twitter Timestamp out of bounds message');
    //             test.equal(res.errors[0].code, twitter_res.code, 'Twitter Timestamp out of bounds code');

    //             test.done();
    //         });

    //     }).end();
    // },
    // twitter_oauth_test: function(test) {
    //     test.expect(2);

    //     var CONSUMER_KEY = gitCfgReader.get("twitter.consumer-key");
    //     var CONSUMER_SECRET = gitCfgReader.get("twitter.consumer-secret");
    //     var token = gitCfgReader.get("twitter.token");
    //     var token_secret = gitCfgReader.get("twitter.token-secret");

    //     var qs = require("querystring");
    //     var oauth = {
    //         consumer_key: CONSUMER_KEY,
    //         consumer_secret: CONSUMER_SECRET,
    //         token: token,
    //         token_secret: token_secret
    //     }, url = 'https://api.twitter.com/1.1/users/search.json?',
    //         params = {
    //             q: "twitter",
    //             page: 1,
    //             count: 5
    //         };

    //     url += qs.stringify(params);

    //     request.get({
    //         url: url,
    //         oauth: oauth,
    //         json: true,
    //         proxy: "http://127.0.0.1:8087",
    //         rejectUnauthorized: false
    //     }, function(e, r, user) {
    //         test.equal(e, null, "When use correct access token should has no error returned.");
    //         test.equal(_.isArray(user), true, "When calling twitter search API, it must returns with an array.");

    //         test.done();
    //     })
    // },
    multi_data_test: function(test) {
        var helper = require("../lib/multi-data");
        //======= USAGE ============================================================
        var options = {
            host: 'staging.v3.kawo.com',
            port: 80,
            path: '/api/v2/uploadtmpimg',
            method: 'POST',
            encoding: 'utf8'
        };

        test.expect(3);

        test.ok( !! helper.postImage, "The multipart data should have postImage method.");

        helper.postImage(options, __dirname + "/facebook.png", {
            // 'Cooikie': 'cookiename=cookievalue'
            "X-AUTH-TOKEN": "2d1d1988-31fa-4f24-ad5f-9df969c81135"
        }, function(err, response) {
            test.equal(err, null, "When upload image to server should not have error");

            test.ok( !! response, "When upload image to server should have response");

            test.done();
        });
    }

};