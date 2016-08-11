(function() {

  angular
    .module('app.auth')
    .factory('authService', authService);


  authService.$inject = ['$firebaseObject', '$firebaseAuth','$location', 'commonService'];
  
  function authService($firebaseObject, $firebaseAuth,$location, commonService) {
	  
	// create an instance of the authentication service
	var ref = commonService.firebaseRef();
	var auth = $firebaseAuth(ref);
	var usersRef = ref.child('auth').child('users');
	
	var service = {
      login: login,
      logout: logout,
      fetchAuthData: fetchAuthData,
      fetchAuthPic: fetchAuthPic,
      fetchAuthEmail: fetchAuthEmail,
      fetchAuthDisplayName:fetchAuthDisplayName
    };
	
	return service;
	
	//Different function of the auth service
	
	function login(service,$scope) {
      return auth.$authWithOAuthPopup(service, {remember: "sessionOnly",
                                                scope: "email"}).then(function (user) {
        console.log("Logged in as:", user.uid);
        var userData = $firebaseObject(usersRef.child(user.uid+'/displayName'));
        userData.$loaded().then(function(){

            var displayName ='';
            if(userData.$value != null && userData.$value !=''){
              displayName = userData.$value;
            }else {
              if (service == 'github') {
                displayName = user.github.displayName;
              }
              if (service == 'google') {
                displayName = user.google.displayName;
              }
            }

            //Update user in db with latest from Github/Google. 
            if (service == 'github') {
              usersRef.child(user.uid).update({
                pic: user.github.profileImageURL,
                email: user.github.email,
                displayName: displayName
              });
            }
            if (service == 'google') {
                usersRef.child(user.uid).update({
                pic: user.google.profileImageURL,
                email: user.google.email,
                displayName: displayName
              });
              
            }

            $scope.displayName = displayName;
            //navBarService.updateNavBar($scope,displayName);
            $location.path('/profile/' + displayName);
            window.location.reload();
            //$location.path('/#/profile/'+displayName);
        });  
      });
  }

    function logout() {
      return auth.$unauth();
    }

    function fetchAuthData() {
  	  var audData = auth.$getAuth();
  	  if (audData) {
          console.log("Fetching fetchAuthData " + audData.uid);
		  return $firebaseObject(usersRef.child(audData.uid));

  	  } else {
		console.log("not login, auth.service");

		if($location.path != "/login") {
			
			$location.path('/login');
		} else {
			return null;
		}
	  }
    }

    function fetchAuthPic() {
      var audData = auth.$getAuth();
      if (audData) {
		console.log("Fetching fetchAuthPic " + audData.uid);
		return $firebaseObject(usersRef.child(audData.uid+'/pic'));
      }
    }
    function fetchAuthEmail() {
      var audData = auth.$getAuth();
      if (audData) {
		console.log("Fetching fetchAuthEmail " + audData.uid);
		return $firebaseObject(usersRef.child(audData.uid+'/email'));
      }
    }

    function fetchAuthDisplayName() {
      var audData = auth.$getAuth();
      var audref = ref.child("/auth/users");
      if (audData) {
    		console.log("Fetching fetchAuthDisplayName " + audData.uid);
    		return $firebaseObject(audref.child(audData.uid).child('displayName'));
      }
    }
  }

})();