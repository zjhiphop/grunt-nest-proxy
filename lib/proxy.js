"use strict";

var request = require("request");
var _ = require("lodash");
var UUID = 1;

var Proxy = function(config) {
    this.config = config;
    this.r = request.defaults(config);
    this._id = UUID++;
}

Proxy.prototype.getHost = function() {
    return this.config.host;
}
Proxy.prototype.getPort = function() {
    return this.config.port;
}
Proxy.prototype.getFullHost = function() {
    var c = this.config;
    return c.proto + "://" + c.host + ':' + c.port;
}

var proxies = [];

var Util = {
    getProxies: function() {
        return proxies;
    },

    add: function(options) {
        proxies.push(new Proxy(options));

        return proxies;
    },
    remove: function(proxy) {
        proxies = _.remove(proxies, function(p) {
            return p._id === proxy._id;
        });
    },
    matchContext: function(context, url) {
        if (!context) return false;

        var positiveContexts, negativeContexts, positiveMatch, negativeMatch;
        var contexts = context;
        if (!_.isArray(contexts)) {
            contexts = [contexts];
        }
        positiveContexts = _.filter(contexts, function(c) {
            return c.charAt(0) !== '!';
        });
        negativeContexts = _.filter(contexts, function(c) {
            return c.charAt(0) === '!';
        });
        // Remove the '!' character from the contexts
        negativeContexts = _.map(negativeContexts, function(c) {
            return c.slice(1);
        });
        negativeMatch = _.find(negativeContexts, function(c) {
            return url.lastIndexOf(c, 0) === 0;
        });
        // If any context negates this url, it must not be proxied.
        if (negativeMatch) {
            return false;
        }
        positiveMatch = _.find(positiveContexts, function(c) {
            return url.lastIndexOf(c, 0) === 0;
        });
        // If there is any positive match, lets proxy this url.
        return positiveMatch != null;
    },
    rewriteURL: function(req) {
        return function(rule) {
            if (rule.from.test(req.url)) {
                req.url = req.url.replace(rule.from, rule.to);
            }
        };
    },
    request: function(req, res, next) {
        var proxied = false;

        proxies && proxies.forEach(function(proxy) {
            if (!proxied && req && Util.matchContext(proxy.config.context, req.url)) {
                if (proxy.config.rules.length) {
                    proxy.config.rules.forEach(Util.rewriteURL(req));
                }

                // proxying twice would cause the writing to a response header that is already sent. Bad config!
                proxied = true;

                var source = req.originalUrl;
                var target = proxy.getFullHost() + req.url;

                proxy.r(target).pipe(res);

                console.log('\r\nNew Proxied request \r\n  Source: ' + source + '\r\n  Target:  ' + target + '\r\n  Headers:   ' + JSON.stringify(req.headers));
            }
        });

        if (!proxied) {
            next();
        }
    }
}

module.exports = Util;