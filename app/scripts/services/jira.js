'use strict';

app.service('Jira', ['$rootScope', '$q', 'HybridStorage', 'Routing', 'Cleanliness', function($rootScope, $q, HybridStorage, Routing, Cleanliness) {
    var config = {
        routes: {
            'fasttrack': {
                'url': 'http://localhost:8000/jira/rest/api/latest/search?jql=project%20%3D%20::project::%20AND%20issuetype%20%3D%20Bug%20AND%20fixVersion%20%3D%20::version::%20AND%20status%20%3D%20::status::'
            }
        },
        cold: true
    };

    var service = {
        config:config,
        getFastTrack: function(projectName) {
            var version = 'CE-1.1';
            var promises = [];
            var self = this;
            var deferred = $q.defer();
            var status = [
                {query:'Open', label: 'Todo'},
                {query:'Closed', label:'Delivered'},
                {query:'Resolved', label:'Done'},
                {query:'"In Progress"', label:'In progress'}
            ];
            var fastTrack = {issues: {}, total: 0};

            for (var i in status) {
                var url = Routing.mapParamsToRoute(this.config.routes.fasttrack.url, {
                    'project': projectName,
                    'version': version,
                    'status': status[i].query
                });

                if (!this.config.cold) {
                    Cleanliness.invalidate(url);
                }

                (function(i) {
                    promises.push(HybridStorage.get(url).then(function(result) {
                        fastTrack.issues[status[i].label] = result;
                        fastTrack.total += result.total;
                    }));
                })(i);
            }

            this.config.cold = false;

            $q.all(promises).then(function() {
                deferred.resolve(fastTrack);
            });

            return deferred.promise;
        }
    };

    return service;
}]);