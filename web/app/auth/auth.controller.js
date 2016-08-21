(function() {

  angular
    .module('app.auth')
    .controller('AuthController', AuthController);

  AuthController.$inject = ['$scope', '$location' ,'$firebaseObject', '$firebaseAuth', 'authService','navBarService', 'commonService'];

  function AuthController($scope, $location, $firebaseObject, $firebaseAuth, authService, navBarService, commonService) {
	var user = authService.fetchAuthData();
	$scope.login = function (service) {
	  console.log("Logging in");
	  authService.login(service,$scope)
		.then(function() {
		//var username = authService.fetchAuthUsername();

		// username.$loaded().then(function(){
		// 	if(username.$value == null){
		// 		$location.path('/createUsername');
		// 	}
		// });
		//$location.path('/');
        })
	    .catch(function (error) {
          console.log("Authentication failed:", error);
        });
      
	  //method to retrieve user from db
	  //var user = authService.fetchAuthData();
	  //user.$loaded().then(function () {
        //console.log("User publicID:", user.publicId);
      //});
	}
	
	$scope.logout = function () {
	  authService.logout();
	  $location.path('/');
	}

	
	$scope.updateDisplayName = function (newName) {
		//var user = authService.fetchAuthData();

		var ref = commonService.firebaseRef().child("auth/users");
		user.$loaded().then(function(user){
			ref.child(user.$id).update({displayName:newName});
			 $location.path('/profile/'+newName);
			
		});
	}

	$scope.createProfileLink = function (newLink) {
		var usedLinksRef = $firebaseObject(commonService.firebaseRef().child("auth/usedLinks"));
		var ref = commonService.firebaseRef().child("auth/usedLinks");
		var userRef = commonService.firebaseRef().child("auth/users");
		usedLinksRef.$loaded().then(function(links) {
				var uid = user.$id;
				var b = links[newLink];
				if(!b){
					//update usedLinks object
					var updateObject = {};
					updateObject[newLink] = uid; 					
					ref.update(updateObject);
					
					userRef.child(uid).update({profileLink: newLink});	

					$location.path('/profile/'+newLink);
					window.location.reload();

				}else {
					alert("Sorry!  \'"+username +"\' is already in use, try another one.");
				}
			});
	}
  };
  

})();