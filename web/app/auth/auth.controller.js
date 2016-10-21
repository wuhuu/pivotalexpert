(function() {

  angular
    .module('app.auth')
    .controller('AuthController', AuthController);

  function AuthController($scope, $location, $firebaseObject, authService) {
    var ref = firebase.database().ref();
    var userRef = ref.child("auth/users");
	var user = firebase.auth().currentUser;

	$scope.login = function () {
	  console.log("Logging in");
	  authService.login();
    $location.path('#/course');
	}


	$scope.logout = function () {
	  authService.logout();
	  $location.path('/');
	}


	$scope.updateDisplayName = function (newName) {


        userRef.child(user.uid).update({displayName:newName});
        $location.path('/profile/'+newName);
	}

    $scope.createProfileLink = function (newLink) {
        var usedLinks = $firebaseObject(ref.child("auth/usedLinks"));
        var usedLinksRef = ref.child("auth/usedLinks");

        newLink = newLink.toLowerCase();
        newLink = newLink.replace(/ /g, "");

        //function to track new registered users
        function recordNewUser() {
            var preDateNow = new Date().toLocaleString("en-US");
            preDateNow = preDateNow.substring(0,preDateNow.indexOf(','));
            var preDateNow2 = preDateNow.replace('\/','');
            var dateNow = preDateNow2.replace('\/','');
            var newUserAnalyticsRef = ref.child('analytics').child('newUsers').child(dateNow);
            var record = {};
            record[user.uid] = true;
            newUserAnalyticsRef.update(record);
        }

        usedLinks.$loaded().then(function(links) {
            var b = links[newLink];
            if(!b){
                //update usedLinks object
                var updateObject = {};
                updateObject[newLink] = user.uid;
                usedLinksRef.update(updateObject);

                userRef.child(user.uid).update({profileLink: newLink});

                //track new registered users
                recordNewUser();

                $location.path('/profile/'+newLink);

            }else {
                alert("Sorry!  \'" + newLink + "\' is already in use, try another one.");
            }
        });

        ref.child('/userProfiles/' + user.uid).update({lastAttempt:""});

    }


  };
})();
