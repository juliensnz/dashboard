'use strict';

app.service('Routing', function() {
    var config = {
        proxy: {
            url: 'http://localhost:8000/',
            routes: [
                {
                    baseUrl: 'https://api.github.com/',
                    proxyUrl: 'github'
                },
                {
                    baseUrl: 'https://scrutinizer-ci.com/',
                    proxyUrl: 'scrutinizer'
                },
                {
                    baseUrl: 'http://ci.akeneo.com/',
                    proxyUrl: 'jenkins'
                },
                {
                    baseUrl: 'https://akeneo.atlassian.net/',
                    proxyUrl: 'jira'
                },
                {
                    baseUrl: 'https://api.travis-ci.org/',
                    proxyUrl: 'travis'
                }
            ]
        }
    };

    var service = {
        config: config,
        get: function(resource, params) {
            var url;

            if (this.config.routes[resource]) {
                url = this.config.routes[resource].url;

                if (params) {
                    url = this.mapParamsToRoute(url, params);
                }
            } else {
                url = resource;
            }

            url = this.clean(url);

            return url
        },
        mapParamsToRoute: function(url, params) {
            for (var key in params) {
                if (url.indexOf('::' + key + '::') != -1) {
                    url = url.replace('::' + key + '::', params[key]);
                }
            }

            return url;
        },
        clean: function(url) {
            var newUrl = url;

            if (url.indexOf('{') != -1 && url.indexOf('}') != -1 && url.indexOf('{') < url.indexOf('}')) {
                newUrl = url.substring(0, url.indexOf('{')) + url.substring(url.indexOf('}') + 1);
            }

            if (url != newUrl) {
                return this.clean(newUrl);
            }

            return newUrl;
        },
        proxify: function(url) {
            var newUrl = url;

            for (var i = this.config.proxy.routes.length - 1; i >= 0; i--) {
                if (url.indexOf(this.config.proxy.routes[i].baseUrl) != -1) {
                    newUrl = this.config.proxy.url
                        + this.config.proxy.routes[i].proxyUrl
                        + '/'
                        + url.substr(this.config.proxy.routes[i].baseUrl.length)
                }

            };

            return newUrl;
        }
    };

    return service;
});