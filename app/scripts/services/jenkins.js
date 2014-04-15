'use strict';

app.service('Jenkins', ['$rootScope', '$q', 'HybridStorage', 'Routing', function($rootScope, $q, HybridStorage, Routing) {
    var config = {
        'routes': {
            'pullStatus': {
                'url': 'http://localhost:8000/jenkins/job/pim-pr-behat/::pullNumber::/api/json'
            }
        },
    };

    var service = {
        config: config,
        getPullRequestStatus: function(pullNumber) {
            var deferred = $q.defer();

            var url = Routing.mapParamsToRoute(this.config.routes.pullStatus.url, {
                'pullNumber': pullNumber
            });

            HybridStorage.get(url).then(function(status) {
                deferred.resolve(status);
            }, function() {
                deferred.resolve();
            });

            return deferred.promise;
        }
    };

    return service;
}])

