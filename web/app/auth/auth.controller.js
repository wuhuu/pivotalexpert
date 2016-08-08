(function() {

  angular
    .module('app.auth')
    .controller('AuthController', AuthController);

  AuthController.$inject = ['$scope', '$location' ,'$firebaseObject', '$firebaseAuth', 'authService','navBarService', 'commonService'];

  function AuthController($scope, $location, $firebaseObject, $firebaseAuth, authService, navBarService, commonService) {
	
	$scope.login = function (service) {
	  console.log("Logging in");
	  authService.login(service,$scope)
		.then(function() {
		var username = authService.fetchAuthUsername();

		username.$loaded().then(function(){
			if(username.$value == null){
				$location.path('/createUsername');
			}
		});
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

	
	$scope.updateDisplayName = function (username) {
		var user = authService.fetchAuthData();

		var ref = commonService.firebaseRef().child("auth");
		user.$loaded().then(function(user){
			
		
			ref.child('usedUsername').once("value", function(snapshot) {
				var uid = user.$id;
				var b = snapshot.child(username).exists();
				if(!b){
					var previousUsername = $firebaseObject(ref.child('usernames').child(uid));	
					// delete the previousUsername for usedUsername
						previousUsername.$loaded().then(function(){
						if(previousUsername.$value!=null){
							ref.child('usedUsername').child(previousUsername.$value).remove();
						}
					
						//update usedUsername object
						var updateObject = {};
						updateObject[username] = true; 					
						ref.child('usedUsername').update(updateObject);
						
						//update usernames object
						updateObject = {};
						updateObject[uid] = username;
						ref.child('usernames').update(updateObject);
						$location.path('/profile/'+username);
						window.location.reload();
					});
				}else {
					alert("Sorry!  \'"+username +"\' is already in use, try another one.");
				}
			});
		});
	}
	
  };
  

})();