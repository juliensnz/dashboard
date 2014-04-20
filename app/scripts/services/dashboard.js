'use strict';

app.service('Dashboard', [
    '$rootScope',
    '$modal',
    'LocalStorage',
    'Github',
    'Jira',
    function($rootScope, $modal, LocalStorage, Github, Jira) {
        var configurationScope = $rootScope.$new();
        var service = {
            init: function() {

                if (!this.getConfig().organizationName) {
                    this.displayConfigurationPanel();
                }
            },
            displayConfigurationPanel: function() {
                var self = this;

                var modalInstance = $modal.open({
                    templateUrl: 'views/modal/init.html',
                    controller: ConfigurationModalCtrl,
                    resolve: {
                        organizationName: function () {
                            return self.getConfig('organizationName');
                        },
                        repoName: function () {
                            return self.getConfig('repoName');
                        }
                    }
                });

                modalInstance.result.then(function (config) {
                    console.log(config);
                    self.setConfig('organizationName', config.organizationName);
                    self.setConfig('repoName', config.repoName);
                }, function () {
                });
            },
            getConfig: function(resource) {
                var config = LocalStorage.get('config');
                console.log(config);

                if (config == null) {
                    config = {};
                }

                if (config[resource] == null) {
                    config[resource] = '';
                }

                LocalStorage.set('config', config);

                return config[resource];
            },
            setConfig: function(resource, value) {
                var config = LocalStorage.get('config');

                console.log(config);

                if (config == null) {
                    config = {};
                }

                config[resource] = value;
                LocalStorage.set('config', config);
            },
            getData: function() {
                Github.getOrganization(this.getConfig('organizationName')).then(function(org) {
                    $scope.org = org;
                }).then(function() {
                    Github.getTopContributors($scope.org).then(function(top) {
                        $scope.topContributors = top;
                    }).then(function() {
                        Github.getTopContributors($scope.org).then(function(top) {
                            $scope.topContributors = top;
                        });
                    });

                    Github.getRepo(this.getConfig('repoName')).then(function(repo) {
                        $scope.repo = repo;
                    }).then(function() {
                        Github.getRepo(this.getConfig('repoName')).then(function(repo) {
                            $scope.repo = repo;
                        });
                    });
                });
            }
        };

        return service;
    }
]);

var ConfigurationModalCtrl = function ($scope, $modalInstance, organizationName, repoName) {
  $scope.organizationName = organizationName;
  $scope.repoName         = repoName;

  $scope.saveConfiguration = function () {
    console.log($scope);
    $modalInstance.close({
        'organizationName': $scope.organizationName,
        'repoName':         $scope.repoName
    });
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};