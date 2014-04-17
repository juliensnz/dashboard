'use strict';

app.controller('MainCtrl', function ($scope, Dashboard) {
    Dashboard.init();
    // Jira.getFastTrack('PIM').then(function(fasttrack) {
    //     $scope.fasttrack = fasttrack;
    // }).then(function() {
    //     Jira.getFastTrack('PIM').then(function(fasttrack) {
    //         $scope.fasttrack = fasttrack;
    //     });
    // });
});
