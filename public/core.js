var musicApp = angular.module('musicApp', ['ngFileUpload']);


musicApp.controller('mainController',function($scope, $http) {
    $scope.formData = {};

    // when landing on the page, get all todos and show them
    $http.post('/songs')
        .success(function(data) {
            $scope.songs = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
})
