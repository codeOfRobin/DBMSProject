var musicApp = angular.module('musicApp', ['ngFileUpload','LocalStorageModule','satellizer','ui.router']);

musicApp.config(function (localStorageServiceProvider, $authProvider, $stateProvider, $urlRouterProvider)
{

    localStorageServiceProvider.setPrefix('musicApp');

    $authProvider.facebook({
        clientId: '473466989524267'
    });
    $urlRouterProvider.otherwise('/login');
    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: './templates/login.html'
        })

        .state('signup', {
            url: '/signup',
            templateUrl: './templates/signup.html'
        })

        .state('profile', {
            url: '/profile',
            templateUrl: './templates/profile.html'
        });

});

musicApp.controller('mainController', ['$scope', 'Upload','localStorageService','$auth' , function ($scope, Upload,localStorageService, $auth) {

    // user stuff
    $scope.isSignedIn = false
    $scope.currentUser = {}
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
            updateAllData()
            return "profile"
        })
        .catch(function(error) {
            console.log(error);
            return "signup"
        });
    };
    $scope.login = function() {
        $auth.login($scope.user)
        .then(function() {
            console.log("logged in user");
            console.log($auth.getPayload().user);
            updateAllData()
            return "profile"
        })
        .catch(function(error) {
            console.log(error);
            return "login"
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
            data ={uploaderId : $scope.currentUser.id}
            if ($scope.isSongPublic)
            {
                data["securityType"] = "public"
            }
            else
            {
                data["securityType"] = "shared"
            }
            // or send them all together for HTML5 browsers:
            Upload.upload({
                url: '/uploadSongs',
                method: 'POST',
                data: data ,// Any data needed to be submitted along with the files
                file: files
            }).then(function (resp) {
                console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
                console.log(resp.data);
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            });
        }
    }


    function updateAllData()
    {
        userRequest()
    }

    //songs
    function getPublicSongs()
    {
        $.post( "/songs/public")
        .done(function( data ) {
            console.log(data);
            $scope.publicSongs = data
            $scope.$apply();
        });
    }

    function getUploadedSongs()
    {
        var postParams = {uploaderId:$scope.currentUser.id}
        $.post( "/songs/uploaded", postParams)
        .done(function( data ) {
            console.log(data);
            $scope.uploadedSongs = data
            $scope.$apply();
        });
    }

    function userRequest()
    {
        $.post( "/user/get", {email:$auth.getPayload().user})
        .done(function( data ) {
            console.log(data);
            $scope.currentUser = data.user
            $scope.$apply();
            getPublicSongs()
            getUploadedSongs()
        });
    }




}]);
