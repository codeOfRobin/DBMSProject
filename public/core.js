var musicApp = angular.module('musicApp', ['ngFileUpload']);

musicApp.controller('mainController', ['$scope', 'Upload', function ($scope, Upload) {
    // upload later on form submit or something similar
    $scope.submit = function() {
        if ($scope.form.file.$valid && $scope.file) {
            $scope.upload($scope.file);
        }
    };

    // for multiple files:
    $scope.uploadFiles = function (files) {
        if (files && files.length)
        {
            data = {id: "asdfkjsndafksandjk"}
            // or send them all together for HTML5 browsers:
            Upload.upload({
                url: '/uploadSongs',
                method: 'POST',
                data: data ,// Any data needed to be submitted along with the files
                file: files
            }).then(function (resp) {
            console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });
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
