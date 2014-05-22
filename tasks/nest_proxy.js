/*
 * grunt-nest-proxy
 * https://github.com/zjhiphop/grunt-nest-proxy
 *
 * Copyright (c) 2014 zjhiphop
 * Licensed under the MIT license.
 */

'use strict';
var _ = require("lodash");
var Proxy = require("../lib/proxy");

var DEFAULTS = {
    rejectUnauthorized: false, // Enable HTTPs reponse witout Authrize
    rules: [],
    context: null,
    proto: "http",
    host: "localhost",
    port: "9000",
    headers: {

    },
    method: "GET",
    proxy: null // The root proxy to catch all the request
};
var CONFIG_NAME = "proxies";

var validateRewrite = function(rule) {
    if (!rule ||
        typeof rule.from === 'undefined' ||
        typeof rule.to === 'undefined' ||
        typeof rule.from !== 'string' ||
        typeof rule.to !== 'string') {
        return false;
    }
    return true;
};

var processRewrites = function(rewrites) {
    var rules = [];

    Object.keys(rewrites || {}).forEach(function(from) {
        var rule = {
            from: from,
            to: rewrites[from]
        };

        if (validateRewrite(rule)) {
            rule.from = new RegExp(rule.from);
            rules.push(rule);
            console.log('Rewrite rule created for: [' + rule.from + ' -> ' + rule.to + '].');
        } else {
            console.log.error('Invalid rule');
        }
    });

    return rules;
};


var validateProxyConfig = function(config) {
    if (!config) {
        console.warn("Config not exists!");

        return false;
    }

    if (!config.context) {
        console.warn("Must has a context!");

        return false;
    }

    if (config.proto === "http" && config.port === 80) {
        console.warn("Protocal is https, but port is 80.");
    }

    return true;
};


module.exports = function(grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerTask('nest_proxy', 'Like http-proxy, but could be nested', function(config) {
        // Merge task-specific and/or target-specific options with these defaults.
        var proxyOptions = [];

        //1. Inital config
        if (config) {
            var connectOptions = grunt.config('connect.' + config) || [];
            proxyOptions = proxyOptions.concat(connectOptions[CONFIG_NAME] || []);
        } else {
            proxyOptions = proxyOptions.concat(grunt.config('connect.' + CONFIG_NAME) || []);
        }

        console.log(proxyOptions);

        //2. Iterator all proxies
        _.forEach(proxyOptions, function(proxy, index) {
            var proxyOption = _.defaults(proxy, DEFAULTS);

            if (validateProxyConfig(proxyOption)) {
                proxyOption.rules = processRewrites(proxyOption.rewrite);

                Proxy.add(proxyOption);

                grunt.log.writeln('Proxy created for: ' + proxyOption.context + ' to ' + proxyOption.host + ':' + proxyOption.port);
            }

        });

    });

};