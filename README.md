# grunt-nest-proxy

> Like grunt-connect-proxy, but nested and simpler

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-nest-proxy --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-nest-proxy');
```

## The "nest_proxy" task

### Overview

#### Basic Usage
In your project's Gruntfile, add a section named `nest_proxy` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
   connect: {
        options: {
            port: 9000,
            // change this to '0.0.0.0' to access the server from outside
            hostname: 'localhost'
        },
        proxies: [{
            context: '/api/v1',
            host: 'yourserver.com',
            port: 80,
            proto: 'http'
        }]
   }   
});
```

### Options
The available configuration options from a given proxy are generally the same as what is provided by the underlying [request](https://github.com/mikeal/request) library.

#### options.context
Type: `String` or `Array`
Default value: ``

The `context` to match requests URL. Matched requests will be proxied. Every url should be start with '/' and not end of '/'. Such as: ['/api/v1', '/api/v2'].

#### options.host
Type: `String`
Default value: `localhost`

The `host` is proxy server's hostname.

#### options.port
Type: `Number`
Default value: `80`

The `port` is proxy server's port number

#### options.proto
Type: `String`
Default Value: `http`

The `proto` is proxy server's http protocol

#### options.proxy
Type: `String`
Default Value: ``

The `proxy` is the proxy of proxy server. Meaning the request will send with this proxy at last. For example, to proxy facebook user infomation in China. As you know, the facebook is blocked in China. So it must make this request go with VPN. Like: `localhost:9000/facebook/search?userXXX -> facebook.com/search?userXXX -> VPN`.

### Usage Examples

#### Basic Configuration
Add new configuration named `proxies` to connect config node.

```js
grunt.initConfig({
   connect: {
        options: {
            port: 9000,
            // change this to '0.0.0.0' to access the server from outside
            hostname: 'localhost'
        },
        proxies: [{
            context: '/api/v1',
            host: 'yourserver.com',
            port: 80,
            proto: 'http'
        }]
   }   
});
```

#### Adding the middleware with LiveReload  

```js
grunt.initConfig({
   connect: {
        options: {
            port: 9000,
            // change this to '0.0.0.0' to access the server from outside
            hostname: 'localhost'
        },
        proxies: [{
            context: '/api/v1',
            host: 'yourserver.com',
            port: 80,
            proto: 'http'
        }],
        livereload: {
          options: {
            middleware: function(connect, options) {
                  // Setup the proxy
                  return [
                      require('grunt-nest-proxy/lib/proxy').request,
                      lrSnippet,
                      mountFolder(connect, 'tmp'),
                      mountFolder(connect, 'app')
                  ];
              }
          }
       }
   }   
});
```

#### Adding the middleware without LiveReload  

```js
grunt.initConfig({
   connect: {
        options: {
            port: 9000,
            // change this to '0.0.0.0' to access the server from outside
            hostname: 'localhost'
        },
        proxies: [{
            context: '/api/v1',
            host: 'yourserver.com',
            port: 80,
            proto: 'http'
        }],
        server: {
            options: {
                middleware: function(connect) {
                    return [
                    	require('grunt-nest-proxy/lib/proxy').request,

                        mountFolder(connect, 'tmp'),
                        mountFolder(connect, 'test'),
                        mountFolder(connect, 'app')
                    ];
                }
            }
        }
   }   
});
```

#### Multi-server proxy configuration

```js
grunt.initConfig({
   connect: {
        options: {
            port: 9000,
            // change this to '0.0.0.0' to access the server from outside
            hostname: 'localhost'
        },
        proxies: [{
            context: '/api/v1',
            host: 'yourserver.com',
            port: 80,
            proto: 'http'
        }],
        server1: {
            options: {
                middleware: function(connect) {
                    return [
                    	require('grunt-nest-proxy/lib/proxy').request,

                        mountFolder(connect, 'tmp'),
                        mountFolder(connect, 'test'),
                        mountFolder(connect, 'app')
                    ];
                }
            }
        },
        server2: {
            options: {
                middleware: function(connect) {
                    return [
                    	require('grunt-nest-proxy/lib/proxy').request,

                        mountFolder(connect, 'tmp'),
                        mountFolder(connect, 'test'),
                        mountFolder(connect, 'app')
                    ];
                }
            }
        }        
   }   
});


grunt.registerTask('test', function (target) {
    grunt.task.run([
        'nest_proxy:server2'
    ]);
});
```

#### Nested proxy

Proxy blocked service to GoAgent server.

```js
grunt.initConfig({
		connect: {
            options: {
                port: 9000,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            proxies: [{
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
                proxy: "http://localhost:8087",
                rewrite: {
                    'tw/search': "1.1/users/search.json"
                },
                /*
                   The OAuth info, you can access https://dev.twitter.com/apps/[Your-Twitter-App-Id]/oauth.
                */
                oauth: {
                    consumer_key: CONSUMER_KEY, // Your consumer key
                    consumer_secret: CONSUMER_SECRET, // Your consumer secret
                    token: TOKEN, // Your access token
                    token_secret: TOKEN_SECRET // Your access secret
                }
            }]
       }
 });
```

#### Use git config to store oauth token and secret

Most time, it's very bad to contains oauth token by hardcode. It's very unsafe when you publish to a public repo. So the way i think use global git config to store this info will be better.

* Add new oauth config sections to git config

```shell
  # Twitter
  git config --global --add twitter.consumer-key [Your Consumer key]
  git config --global --add twitter.consumer-secret [Your Consumer secret]
  git config --global --add twitter.token [Your token]
  git config --global --add twitter.token-secret [Your token secret]
  
  #Facebook
  git config --global --add facebook.token [Your facebook access token] 
  
  # Check all configs 
   git config --global -l
  
```  
* Config file
```js
grunt.initConfig({
		connect: {
            options: {
                port: 9000,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            proxies: [{
                context: '/fb/search',
                host: 'graph.facebook.com',
                proto: "https",
                port: 443,
                proxy: "http://localhost:8087",
                rewrite: {
                    'token': 'access_token=' + "{{git-facebook-config.token}}",
                    'fb/search': "v2.0/search"
                }
            }, {
                context: '/tw/search',
                host: 'api.twitter.com',
                proto: "https",
                proxy: "http://localhost:8087",
                rewrite: {
                    'tw/search': "1.1/users/search.json"
                },
                /*
                   The OAuth info, you can access https://dev.twitter.com/apps/[Your-Twitter-App-Id]/oauth.
                */
                oauth: "{{git-twitter-config}}"
            }]
       }
 });
```

### Adding the configureProxy task to the server task

For the server task, add the `nest_proxy` task before the connect task

```js
	grunt.registerTask('server', function(target) {
        grunt.task.run([
            'clean:server',
            'nest_proxy',
            'connect:livereload',
            'open:server',
            'watch'
        ]);
    });
```

## ISSUES
* Not support `WebSocket` yet

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
==================
* 0.0.1
	+ Support blocked service proxy
	+ Http GET request

* 0.0.5
    + Fix a few bugs
    + Enable all HTTP request method (GET/POST/PUT/DEL/HEAD)
    + fix twitter https request can not use 443 port issue
    + Integrate git config support for config oauth token
