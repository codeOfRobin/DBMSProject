var musicApp = angular.module('musicApp', ['ngFileUpload','LocalStorageModule','satellizer']);

musicApp.config(function (localStorageServiceProvider, $authProvider)
{

    localStorageServiceProvider.setPrefix('musicApp');

    $authProvider.facebook({
        clientId: '473466989524267'
    });

});

musicApp.controller('mainController', ['$scope', 'Upload','localStorageService','$auth' , function ($scope, Upload,localStorageService, $auth) {

    // user stuff
    $scope.isSignedIn = false
    $scope.isAuthenticated = function() {
        return $auth.isAuthenticated();
    };
    $scope.authenticate = function(provider) {
        $auth.authenticate(provider)
        .then(function()
        {
            console.log("auth ho gaya");
            console.log($auth.getPayload());

        })
    };
    var user = {
        email: $scope.email,
        password: $scope.password
    };
    $scope.signup = function() {
        $auth.signup($scope.user)
        .then(function() {
            console.log("signed up user");
            console.log($auth.getPayload().user);
        })
        .catch(function(error) {
            console.log(error);
        });
    };
    $scope.login = function() {
        $auth.login($scope.user)
        .then(function() {
            console.log("logged in user");
            console.log($auth.getPayload().user);
        })
        .catch(function(error) {
            console.log(error);
        });
    };


    //upload stuff
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




    //songs
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
        // localStorageService.set("something","something else")
        console.log(localStorageService.get("something"));
    });

    $.post( "/user/get", {email:$auth.getPayload().user})
    .done(function( data ) {
        console.log(data);
        $scope.currentUser = data.user
        $scope.$apply();
    });



}]);
