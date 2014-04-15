'use strict';

app.service('Scrutinizer', ['$rootScope', '$q', 'HybridStorage', 'Routing', function($rootScope, $q, HybridStorage, Routing) {

    var config = {
        'routes': {
            'repo': {
                'url': 'http://localhost:8000/scrutinizer/api/repositories/g/::repoName::?access_token='
            },
            'report': {
                'url': 'http://localhost:8000/scrutinizer::reportUrl?access_token='
            },
            'indice': {
                'url': 'http://localhost:8000/scrutinizer/api/repositories/g/::repoName::/indices/::commitReference::?access_token='
            }
        }
    };

    var service = {
        config: config,
        getRepositoryStats:  function(repo) {
            var deferred = $q.defer();
            var today = new Date();
            var month = (today.getMonth() + 1 < 10 ? '0' + (today.getMonth() + 1)  : today.getMonth() + 1);
            var date = today.getFullYear() + '-' + month + '-' + today.getDate();

            var url = Routing.mapParamsToRoute(this.config.routes.repo.url, {
                'repoName': repoName,
                'date': date
            });

            HybridStorage.get(url).then(function(stats) {
                stats.applications[stats.default_branch].index._embedded.project.metric_values
                var statistics = {};

                for (var application in stats.applications) {
                    statistics[application] = stats.applications[application].index._embedded.project.metric_values;
                }

                deferred.resolve(stats);
            });

            return deferred.promise;
        },
        getCommitStats: function(repoName, commitReference) {
            var deferred = $q.defer();

            var url = Routing.mapParamsToRoute(this.config.routes.indice.url, {
                'repoName': repoName,
                'token': this.config.token,
                'commitReference': commitReference
            });

            HybridStorage.get(url).then(function(indice) {
                console.log(indice);
                deferred.resolve(indice);
            });

            return deferred.promise;
        }
    };

    return service;
}]);
