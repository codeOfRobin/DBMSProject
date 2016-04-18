var musicApp = angular.module('musicApp', ['ngFileUpload']);


musicApp.controller('mainController',function($scope, $http) {
    $scope.formData = {};

    var data = {};
    data.title = "title";
    data.message = "message";
    data.songs = ["forgot me now", "heartless", "Bury it"]
    $.post( "/songs", data)
    .done(function( data ) {
        console.log(data);
        $scope.songs = data.songs
        $scope.$apply();
    });
})
