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
            updateAllData()
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
            updateAllData()
        })
        .catch(function(error) {
            console.log(error);
        });
    };
    $scope.logoutCurrentUser = function()
    {
        $auth.logout()
        $auth.removeToken()
    }

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
                userRequest()
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            });
        }
    }

    $scope.shareSong = function(uploadedSong)
    {
        var postParams = {sharedToEmail : uploadedSong.shareTo, songId: uploadedSong.id, sharedFromId:$scope.currentUser.id, token: $auth.getToken()}
        $.post( "/share/create", postParams)
        .done(function( data ) {
            console.log(data);
            userRequest()
        });
    }
    $scope.ratingChange = function(publicSong)
    {
        var postParams = {userId : $scope.currentUser.id, songId: publicSong.id, rating:publicSong.rating,token: $auth.getToken()}
        $.post( "/rating/set", postParams)
        .done(function( data ) {
            console.log(data);
            userRequest()
        });
    }
    function updateAllData()
    {
        userRequest()
    }

    //songs
    function getPublicSongs()
    {
        $.post( "/songs/public",{token:$auth.getToken()})
        .done(function( data ) {
            console.log(data);
            $scope.publicSongs = data
            $scope.$apply();
            getPublicRatings()
        });
    }

    function getPublicRatings()
    {
        for (var index in $scope.publicSongs)
        {
            $.post( "/songAvg/get",{token:$auth.getToken(),songId:$scope.publicSongs[index].id})
            .done(function( data ) {
                console.log(data);
                $scope.publicSongs[index].averageRating = data[0].avg
                $scope.$apply();
            });

        }
    }
    function getUploadedSongs()
    {
        var postParams = {uploaderId:$scope.currentUser.id,token: $auth.getToken()}
        $.post( "/songs/uploaded", postParams)
        .done(function( data ) {
            console.log(data);
            $scope.uploadedSongs = data
            $scope.$apply();
        });
    }

    function getSharedSongs()
    {
        var postParams = {sharedTo:$scope.currentUser.id,token: $auth.getToken()}
        $.post( "/songs/shared", postParams)
        .done(function( data ) {
            console.log(data);
            $scope.sharedSongs = data
            $scope.$apply();
        });
    }

    function userRequest()
    {
        $.post( "/user/get", {email:$auth.getPayload().user,token: $auth.getToken()})
        .done(function( data ) {
            console.log(data);
            $scope.currentUser = data.user
            if (data.user.email == "admin@admin.com")
            {
                $scope.isAdmin = true
            }
            $scope.$apply();
            getPublicSongs()
            getUploadedSongs()
            getSharedSongs()
        });
    }

    $scope.deleteSong = function(uploadedSong)
    {
        $.post( "/song/delete", {email:$auth.getPayload().user,token: $auth.getToken(),songId:uploadedSong.id})
        .done(function( data ) {
            console.log(data);

            getPublicSongs()
            getUploadedSongs()
            getSharedSongs()
            $scope.apply()
        });
    }




}]);
