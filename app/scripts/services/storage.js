'use strict';

var loadingCount = 0;

app.service('LocalStorage', ['$rootScope', function($rootScope) {
    var config = {};

    var service = {
        config: config,
        get: function(resource) {
            return JSON.parse(localStorage.getItem(resource));
        },
        set: function(resource, data) {
            localStorage.setItem(resource, JSON.stringify(data));
        }
    };

    return service;
}]);

app.service('DistantStorage', ['$rootScope', '$http', '$q', 'Routing', function($rootScope, $http, $q, Routing) {
    var config = {};

    var service = {
        config: config,
        get: function(url, config) {
            return $http.get(url, config);
        }

    };

    return service;
}]);

app.service('HybridStorage', ['$rootScope', '$http', '$q', 'LocalStorage', 'DistantStorage', 'Cleanliness', 'Routing', function($rootScope, $http, $q, LocalStorage, DistantStorage, Cleanliness, Routing) {
    var config = {};

    $rootScope.$on('activity.loading.start', function() {
        loadingCount++;
        $rootScope.loading = loadingCount > 0;
    });

    $rootScope.$on('activity.loading.stop', function() {
        loadingCount--;
        $rootScope.loading = loadingCount > 0;
    });

    var service = {
        config: config,
        getResource: function(resource, params) {
            var url = Routing.get(resource, params);

            return this.get(url);
        },
        get: function(url, config) {
            url = Routing.clean(url);
            var deferred = $q.defer();

            $rootScope.$emit('activity.loading.start');
            if (Cleanliness.isValid(url) && typeof LocalStorage.get(url) != 'undefined') {
                $rootScope.$emit('activity.loading.stop');
                deferred.resolve(LocalStorage.get(url));
            } else {
                DistantStorage.get(url, config).success(function(data, status, header, config) {
                    $rootScope.$emit('activity.loading.stop');
                    LocalStorage.set(url, data);
                    Cleanliness.validate(url);
                    deferred.resolve(LocalStorage.get(url));
                }).error(function(data, status, header, config) {
                    $rootScope.$emit('activity.loading.stop');
                    $rootScope.$emit('activity.loading.error', data);
                    deferred.reject('Loading error');
                });
            }

            return deferred.promise;
        },
        getAndUpdateResource: function(resource, params) {
            var url = Routing.get(resource, params);

            return this.getAndUpdate(url);
        },
        getAndUpdate: function(url) {
            url = Routing.clean(url);
            Cleanliness.invalidate(url);

            return this.get(resource, params);
        }
    };

    return service;
}]);


app.service('Cleanliness', function() {
    var service = {
        init: function() {
            if (!localStorage.getItem('cleanliness')) {
                localStorage.setItem('cleanliness', JSON.stringify({}));
            }
        },
        isValid: function(resource) {
            return this.getCleanlinessTable()[resource] && this.getCleanlinessTable()[resource].valid;
        },
        getCleanlinessTable: function() {
            return JSON.parse(localStorage.getItem('cleanliness'));
        },
        setCleanlinessTable: function(data) {
            localStorage.setItem('cleanliness',JSON.stringify(data));
        },
        invalidate: function(resource) {
            var cleanlinessTable = this.getCleanlinessTable();

            if (!cleanlinessTable[resource]) {
                cleanlinessTable[resource] = {};
            }

            cleanlinessTable[resource].valid = false;

            this.setCleanlinessTable(cleanlinessTable);
        },
        validate: function(resource) {
            var cleanlinessTable = this.getCleanlinessTable();

            if (!cleanlinessTable[resource]) {
                cleanlinessTable[resource] = {};
            }

            cleanlinessTable[resource].valid = true;

            this.setCleanlinessTable(cleanlinessTable);
        }
    };

    service.init();

    return service;
});
