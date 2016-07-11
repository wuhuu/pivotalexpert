(function() {
  'use strict';

  angular
    .module('app.auth')
    .controller('SampleCtrl', SampleCtrl);

  // Define the controller.
function SampleCtrl($scope, $firebaseArray, $firebaseObject, $firebaseAuth) {
    $scope.ref = new Firebase("https://pivotal-expert.firebaseio.com");

    // create a synchronized array
    $scope.logs = $firebaseArray($scope.ref.child('logs/profileUpdates'));

    $scope.usersRef = $scope.ref.child('users');
    $scope.updateTasks = $firebaseArray($scope.ref.child('queue/tasks'));

    var query = $scope.ref.child('logs/profileUpdates').orderByChild("updated").limitToLast(10);
    $scope.filteredLogs = $firebaseArray(query);

    var query2 = $scope.ref.child('pivotalExpert/userAchievements').orderByChild("updated").limitToLast(10);
    $scope.allUserAchievements = $firebaseArray(query2);

    // create an instance of the authentication service
    var auth = $firebaseAuth($scope.ref);
    // login with github
    var usersRef = $scope.ref.child('auth').child('users');

    $scope.allUsers = $firebaseArray($scope.ref.child('pivotalExpert/userProfiles'));
   
    $scope.getAchievementList = function(){
      $scope.achievements =  $firebaseArray($scope.ref.child('pivotalExpert/achievements'));
    }
    //Run once on load. 
    $scope.getAchievementList();
     
    $scope.markAchievementCompleted = function(achievementId){
       $scope.ref.child('pivotalExpert')
       .child('userProfiles')
       .child($scope.user.publicId)
       .child('userAchievements')
       .child(achievementId).set(true);
    }
    
    $scope.markAchievementUncompleted = function(achievementId){
       $scope.ref.child('pivotalExpert')
       .child('userProfiles')
       .child($scope.user.publicId)
       .child('userAchievements')
       .child(achievementId).set(false);
    }
    $scope.logout = function () {
      //console.log("Logging user out.")
      $scope.ref.unauth();
      $scope.user = null;
    };

    $scope.fetchAchievements = function (publicId) {
      console.log("Fetching achievements for " + publicId);
      $scope.userAchievements = $firebaseObject($scope.ref.child('pivotalExpert/userAchievements/' + publicId));
    }

    $scope.fetchPivotalExpertProfile = function (publicId) {
      console.log("Fetching publicId " + publicId);
      $scope.profile = $firebaseObject($scope.ref.child('pivotalExpert/userProfiles/' + publicId));
      $scope.fetchAchievements(publicId);
    }

    $scope.fetchAuthData = function (authId) {
      console.log("Fetching authId " + authId);
      $scope.user = $firebaseObject($scope.ref.child('auth/users/' + authId));
      // Once auth data loads, load the user's public profile. 
      $scope.user.$loaded().then(function () {
        if ($scope.user.publicId) {
          $scope.fetchPivotalExpertProfile($scope.user.publicId);
        } else {
          console.log("User has no publicId.");
        }
      });

    }

    //Check to see if user is already logged in an fetch auth data if so
    var authData = $scope.ref.getAuth();
    if (authData) {
      console.log("User " + authData.uid + " is logged in with " + authData.provider);
      $scope.fetchAuthData(authData.uid);
    } else {
      //console.log("User is logged out");
    }

    $scope.addNewUserProfile = function () {
      console.log("Adding new user profile.");
      //Do as a transaction. 
      //update auth/users/<authId>

      var isAvailable = $firebaseObject($scope.ref.child('auth').child('usedPublicIds').child($scope.newProfileId));
      isAvailable.$loaded().then(function () {

        if (isAvailable.$value) {
          console.log(isAvailable.$value + "was already taken");
        } else {
          //if id has not been claimed. 

          usersRef.child($scope.user.$id).update({ 'publicId': $scope.newProfileId });

          //add reverse lookup entry.
          $scope.ref.child('auth').child('publicIds').child($scope.newProfileId).set($scope.user.$id);

          //create new userProfile public to everyone. 
          $scope.ref.child('pivotalExpert').child('userProfiles')
            .child($scope.newProfileId)
            .child('user')
            .update({
              'displayName': $scope.newProfileId,
              'pic': $scope.user.pic
            }, function () {
              console.log("done creating profile");
              $scope.fetchPivotalExpertProfile($scope.newProfileId);
            });

          // mark as taken
          $scope.ref.child('auth').child('usedPublicIds').child($scope.newProfileId).set(true);
        }
      });
    }

    $scope.googleLogin = function () {
      console.log("here");
      $scope.ref.authWithOAuthPopup("google", function (error, authData) {

        console.log(authData)
        //usersRef.child(authData.uid).update(authData.google);

        usersRef.child(authData.uid).update({
          //username: authData.google.username,
          pic: authData.google.profileImageURL,
          email: authData.google.email,
          displayName: authData.google.displayName
        });
        $scope.fetchAuthData(authData.uid);

      }, {
          scope: "email"
        });
    }

    $scope.login = function (service) {
      console.log("Logging user in.")
      auth.$authWithOAuthPopup(service).then(function (user) {
        console.log("Logged in as:", user.uid);

        //Always update user with latest from Github. 
        if (service == 'github') {

          usersRef.child(user.uid).update({
            username: user.github.username,
            pic: user.github.profileImageURL,
            email: user.github.email,
            displayName: user.github.displayName
          });

        } else {
          console.log('non-supported service.');
        }

        // Fetch auth back from users to get get latest information. 
        $scope.fetchAuthData(user.uid);

      }).catch(function (error) {
        console.log("Authentication failed:", error);
      });
    };

    $scope.addProfileUpdateTask = function () {
      $scope.updateTasks.$add({
        id: $scope.id,
        service: $scope.service
      });
    };

    $scope.updateAllServices = function () {
      console.log("Enqueueing " + $scope.profile.$id);
        $scope.updateTasks.$add({ id: $scope.profile.$id, service: "TESTING" });
    };

    $scope.getTheTime = function (timestamp) {
      return new Date(timestamp).toString();
    }

    $scope.timePassed = function (timestamp) {
      var delta = new Date() - new Date(timestamp);
      return delta / 60000;
    }


  };
  

})();