var musicApp = angular.module('musicApp', ['ngFileUpload']);

musicApp.controller('mainController', ['$scope', 'Upload', function ($scope, Upload) {
    // upload later on form submit or something similar
    $scope.submit = function() {
        if ($scope.form.file.$valid && $scope.file) {
            $scope.upload($scope.file);
        }
    };

    // upload on file select or drop
    $scope.upload = function (file) {
        Upload.upload({
            url: 'upload/url',
            data: {file: file, 'username': $scope.username}
        }).then(function (resp) {
            console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });
    };
    // for multiple files:
    $scope.uploadFiles = function (files) {
        if (files && files.length)
        {
            // or send them all together for HTML5 browsers:
            Upload.upload({data: {file: files}});
        }
    }
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
}]);
