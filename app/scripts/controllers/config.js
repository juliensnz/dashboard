'use strict';

app.controller('ConfigurationCtrl', ['$scope', '$rootScope', '$element', 'Config', 'Github', 'Jira', function($scope, $rootScope, $element, Config, Github, Jira) {

    $rootScope.$on('configuration.show', function(event) {
        $element.modal('show');
    });

    $scope.organizationName   = Config.getConfig('organizationName');
    $scope.repoName           = Config.getConfig('repoName');
    $scope.jiraProjectName    = Config.getConfig('jiraProjectName');
    $scope.jiraProjectVersion = Config.getConfig('jiraProjectVersion');

    $scope.updateOrganization = function() {
        Github.getRepos($scope.organizationName).then(function(repoList) {
            $scope.repoList = repoList;
        });
    };

    $scope.updateOrganization();

    $scope.updateProject = function() {
        Jira.getProject($scope.jiraProjectName).then(function(project) {
            $scope.project = project;
        });
    };

    $scope.updateProject();

    $scope.saveConfiguration = function () {
        $rootScope.$emit('configuration.updated');
        $rootScope.$emit('configuration.hide');

        Config.setConfig('organizationName', $scope.organizationName);
        Config.setConfig('repoName', $scope.repoName);
        Config.setConfig('jiraProjectName', $scope.jiraProjectName);
        Config.setConfig('jiraProjectVersion', $scope.jiraProjectVersion);

        $element.modal('hide');
    };

    $scope.cancel = function () {
        $rootScope.$emit('configuration.hide');
        $element.modal('hide');
    };
}]);