(function() {

  angular
    .module('app.auth')
    .controller('AuthController', AuthController);

  function AuthController($scope, $location, $firebaseObject, authService) {
    var ref = firebase.database().ref();
    var userRef = ref.child("auth/users");
	var user = authService.fetchAuthData();

	$scope.login = function () {
	  console.log("Logging in");
	  authService.login();      
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

        usedLinks.$loaded().then(function(links) {
            var uid = user.uid;
            var b = links[newLink];
            if(!b){
                //update usedLinks object
                var updateObject = {};
                updateObject[newLink] = uid; 					
                usedLinksRef.update(updateObject);
                
                userRef.child(uid).update({profileLink: newLink});	

                $location.path('/profile/'+newLink);

            }else {
                alert("Sorry!  \'" + newLink + "\' is already in use, try another one.");
            }
        });

        ref.child('/userProfiles/' + user.$id).update({lastAttempt:"C0Q0"});
        
    }


  };
})();