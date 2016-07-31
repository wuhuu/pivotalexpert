(function() {

  angular
    .module('app.auth')
    .factory('authService', authService);


  authService.$inject = ['$firebaseObject', '$firebaseAuth','$location'];
  
  function authService($firebaseObject, $firebaseAuth,$location) {
	  
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
                username: user.github.username,
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
            $location.path('/');
            window.location.reload();
            //$location.path('/#/profile/'+displayName);
        });  

        

		//console.log("Logged in as DisplayName:", user.github.displayName);
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