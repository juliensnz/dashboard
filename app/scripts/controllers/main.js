'use strict';

app.controller('MainCtrl', function ($scope, Dashboard, Config) {
    $scope.$on('$viewContentLoaded', function () {
        Dashboard.init();
    });

    $scope.setConfiguration = function() {
        Config.showConfigModal();
    };
});
