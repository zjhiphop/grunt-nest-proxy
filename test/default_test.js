'use strict';

var Proxy = require('../lib/proxy');

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

exports.nest_proxy = {
    setUp: function(done) {
        // setup here if necessary
        done();
    },
    default_options: function(test) {
        test.expect(6);

        var p = Proxy.getProxies();
        var c = p[0].config;

        test.equal(p.length, 1, "The initialized proxies should be 1");
        test.equal(typeof c, "object", "The default config must be an object");
        test.equal(c.port, 9000, "The default port should be 9000");
        test.equal(c.host, "localhost", "The default host should be localhost");
        test.equal(c.proto, "http", "The default protocol should be http");
        test.equal(c.context, null, "The default protocol should be null");

        test.done();
    }
};