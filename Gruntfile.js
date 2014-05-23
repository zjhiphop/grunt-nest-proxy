/*
 * grunt-nest-proxy
 * https://github.com/zjhiphop/grunt-nest-proxy
 *
 * Copyright (c) 2014 zjhiphop
 * Licensed under the MIT license.
 */

'use strict';
var fbToken = "CAACEdEose0cBAONJV2fkx3CYjTfMKEILEkAgv9SOgiMouv5jlk8ntz4W2DCm5zdnn2Kl6LbKDY7SujWJhBVPaqZAmnRPJfZCwoToY6PlZBx4noQhDxvTna7WUesw4lCKQZBWLecuRcNFXDw9aQAMPGQMrWqfjxS1Qd0KZBy5IZB6OjcmIhUcA2OYHQR7aEKZCgZD";
var twAuth = 'OAuth realm="",oauth_consumer_key="9ujQ0DFkKffmMyfGCEiSMrNTL",oauth_token="308884292-Rgb7vx2XYN0ucBhHNepn372v1BvDpAZ9PNUC2vpX",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1400581005",oauth_nonce="KPpmoC",oauth_version="1.0",oauth_signature="VJMpUXWrMtrb%2BkgcTWR5MgcWtkc%3D"';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                '<%= nodeunit.tests %>'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['tmp']
        },

        // Configuration to be run (and then tested).
        // Configuration to be run (and then tested).
        connect: {
            options: {
                port: 9000,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            proxies: [{
                rejectUnauthorized: false, // Enable HTTPs reponse witout Authrize
                context: null,
                proto: "http",
                host: "localhost",
                port: "9000",
                headers: {},
                method: "GET",
                proxy: null // The root proxy to catch all the request
            }],
            request: {
                options: {
                    middleware: function(connect, options) {
                        return [require('./lib/proxy').request];
                    }
                },
                proxies: [{
                    context: '/request',
                    host: 'localhost',
                    port: 8080,
                    headers: {
                        "x-proxied-header": "added"
                    }
                }, {
                    context: '/fb/search',
                    host: 'graph.facebook.com',
                    proto: "https",
                    port: 443,
                    proxy: "http://localhost:8087",
                    rewrite: {
                        'token': 'access_token=' + fbToken,
                        'fb/search': "v2.0/search"
                    }
                }, {
                    context: '/tw/search',
                    host: 'api.twitter.com',
                    proto: "https",
                    port: 443,
                    proxy: "http://localhost:8087",
                    rewrite: {
                        'tw/search': "1.1/users/search.json"
                    },
                    headers: {
                        Authorization: twAuth
                    }
                }]
            }
        },

        // Unit tests.
        nodeunit: {
            defaults: 'test/default_test.js',
            request: 'test/request_test.js'
        }

    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', [
        'clean',
        'nest_proxy',
        'nodeunit:defaults',
        'nest_proxy:request',
        'connect:request',
        'nodeunit:request'
    ]);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);

};