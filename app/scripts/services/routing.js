'use strict';

app.service('Routing', function() {
    var config = {
        'routes': {
            'orgs': {
                'url': 'https://api.github.com/orgs/::organizationName::'
            }
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
        }
    };

    return service;
});