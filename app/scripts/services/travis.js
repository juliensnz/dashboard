'use strict';

app.service('Travis', ['$rootScope', '$q', 'HybridStorage', 'Routing', function($rootScope, $q, HybridStorage, Routing) {
    var config = {
        'routes': {
            'builds': {
                'url': 'http://localhost:8000/travis/repos/::repoName::/builds'
            },
            'build': {
                'url': 'http://localhost:8000/travis/repos/::repoName::/builds/::buildId::'
            }
        }
    };

    var service = {
        config: config,
        getPullRequestStatus: function(repoName, pullNumber) {
            var deferred = $q.defer();
            var self = this;
            var url = Routing.mapParamsToRoute(this.config.routes.builds.url, {'repoName': repoName});
            var promises = [];

            HybridStorage.get(url).then(function(builds) {
                for (var build in builds) {
                    if (builds[build].event_type == 'pull_request') {
                        var buildUrl = Routing.mapParamsToRoute(self.config.routes.build.url, {
                            'repoName': repoName,
                            'buildId': builds[build].id
                        });

                        promises.push(HybridStorage.get(buildUrl).then(function(build) {
                            var buildPrNumber = build.compare_url.substr(build.compare_url.lastIndexOf('/') + 1);

                            if (buildPrNumber == pullNumber) {
                                deferred.resolve(build);
                            }
                        }));
                    }
                }

                $q.all(promises).then(function() {
                    deferred.resolve({});
                });
            });

            return deferred.promise;
        }
    }

    return service;
}]);