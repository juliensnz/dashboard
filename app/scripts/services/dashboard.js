'use strict';

app.service('Dashboard', [
    '$rootScope',
    '$aside',
    'LocalStorage',
    'Github',
    'Jira',
    function($rootScope, $aside, LocalStorage, Github, Jira) {
        var configurationScope = $rootScope.$new();
        var service = {
            init: function() {

                if (!this.getConfig().organizationName) {
                    this.displayConfigurationPanel();
                }
            },
            displayConfigurationPanel: function() {
                $rootScope.configurationTitle = 'test';
                $rootScope.showConfiguration = false;
            },
            getConfig: function() {
                var config = LocalStorage.get('config');

                if (config == null) {
                    config = {};

                    LocalStorage.set('config', config);
                }

                return config;
            },
            setConfig: function(config) {
                LocalStorage.set('config', config);
            },
            getData: function() {
                Github.getOrganization(this.getConfig().organizationName).then(function(org) {
                    $scope.org = org;
                }).then(function() {
                    Github.getTopContributors($scope.org).then(function(top) {
                        $scope.topContributors = top;
                    }).then(function() {
                        Github.getTopContributors($scope.org).then(function(top) {
                            $scope.topContributors = top;
                        });
                    });

                    Github.getRepo(this.getConfig().repoName).then(function(repo) {
                        $scope.repo = repo;
                    }).then(function() {
                        Github.getRepo(this.getConfig().repoName).then(function(repo) {
                            $scope.repo = repo;
                        });
                    });
                });
            }
        };

        return service;
    }
]);