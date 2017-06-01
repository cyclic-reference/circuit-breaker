'use strict';

var app = angular.module('power', ['ngMaterial']);
app.controller('powerCtrl',['$scope', '$window', function ($scope, $window) {
    $scope.power = false;
    $scope.powerToggle = function(){
        $scope.power = !$scope.power;
    }

}]);