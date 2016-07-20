(function() {

  angular
    .module('app.auth')
    .factory('authService', authService);


  authService.$inject = ['$firebaseObject', '$firebaseAuth'];
  
  function authService($firebaseObject, $firebaseAuth) {
	  
	// create an instance of the authentication service
	var ref = new Firebase("https://pivotal-expert.firebaseio.com");
	var auth = $firebaseAuth(ref);
	var usersRef = ref.child('auth').child('users');
	
	var service = {
      login: login,
      logout: logout,
      fetchAuthData: fetchAuthData
    };
	
	return service;
	
	//Different function of the auth service
	
	function login(service) {
      return auth.$authWithOAuthPopup(service).then(function (user) {
        console.log("Logged in as:", user.uid);

        //Update user in db with latest from Github/Google. 
        if (service == 'github') {
          usersRef.child(user.uid).update({
            username: user.github.username,
            pic: user.github.profileImageURL,
            email: user.github.email,
            displayName: user.github.displayName
          });
        }
		if (service == 'google') {
          usersRef.child(user.uid).update({
            pic: user.google.profileImageURL,
			email: user.google.email,
			displayName: user.google.displayName
          });
        }
		console.log("Logged in as DisplayName:", user.github.displayName);
      });
    }

    function logout() {
      return auth.$unauth();
    }

    function fetchAuthData() {
	  var audData = auth.$getAuth();
	  if (audData) {
        console.log("Fetching authId " + audData.uid);
	    return $firebaseObject(usersRef.child(audData.uid));
	  } else {
		console.log("not login");
		return null;
	  }
	  
    }

  }

})();