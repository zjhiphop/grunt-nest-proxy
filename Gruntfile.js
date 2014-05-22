/*
 * grunt-nest-proxy
 * https://github.com/zjhiphop/grunt-nest-proxy
 *
 * Copyright (c) 2014 zjhiphop
 * Licensed under the MIT license.
 */

'use strict';

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
                context: '/full',
                host: 'www.full.com',
                port: 8080,
                proto: "http",
                rejectUnauthorized: false,
                rewrite: {
                    '^/full': '/anothercontext'
                },
                headers: {
                    "X-Proxied-Header": "added"
                }
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
                    changeOrigin: true,
                    headers: {
                        "x-proxied-header": "added"
                    }
                }]
            }
        },

        // Unit tests.
        nodeunit: {
            tests: ['test/*_test.js']
        }

    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'nest_proxy', 'nodeunit']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);

};