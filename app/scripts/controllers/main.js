'use strict';

app.controller('MainCtrl', function ($scope, Github, Jira) {
    Github.getOrganization('akeneo').then(function(org) {
            $scope.org = org;
    }).then(function() {
        Github.getTopContributors($scope.org).then(function(top) {
            $scope.topContributors = top;
        });

        Github.getRepo('akeneo/pim-community-dev').then(function(repo) {
            $scope.repo = repo;
        });
    });

    Jira.getFastTrack('PIM').then(function(fasttrack) {
        $scope.fasttrack = fasttrack;
    }).then(function() {
        Jira.getFastTrack('PIM').then(function(fasttrack) {
            $scope.fasttrack = fasttrack;
        });
    });

    window.scope = $scope;
});
