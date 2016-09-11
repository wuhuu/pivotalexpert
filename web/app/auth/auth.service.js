(function() {

  angular
    .module('app.auth')
    .factory('authService', authService);

  function authService($firebaseObject, $firebaseAuth, $location, $rootScope) {
	  
	// create an instance of the authentication service
	var ref = firebase.database().ref();
	var auth = $firebaseAuth();
	var usersRef = ref.child('auth/users');
	
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
	
	function login() {
      
      var provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/userinfo.email');
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      
      firebase.auth().signInWithPopup(provider).then(function(result) {

        console.log("login success");
        // The signed-in user info.
        var user = result.user;
        
        usersRef.child(user.uid).update({
          pic: user.photoURL,
          email: user.email,
          displayName: user.displayName
        });

        ref.child('/signinLogs/' + user.uid).set(new Date().toLocaleString("en-US"));
        
        var userData = $firebaseObject(usersRef.child(user.uid));
        //navBarService.updateNavBar(user.displayName);
        userData.$loaded().then(function(){
           
            $rootScope.logined = true;
            if(userData.profileLink == null) {
              $location.path('/createProfileLink');
            }
            else{
              $location.path('/profile/' + userData.profileLink);
            }
        });
      });
  }

    function logout() {
      return firebase.auth().signOut();
    }

    function fetchAuthData() {
      var user = firebase.auth().currentUser;

      if (user) {
        // User is signed in.
        console.log("Fetching fetchAuthData " + user.uid);
        return user;
        
      } else {
        // No user is signed in.
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