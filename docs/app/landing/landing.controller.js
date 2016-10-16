(function() {

  angular
    .module('app.landing')
    .controller('LandingController', LandingController);

  function LandingController($rootScope, $firebaseObject,$location) {
	  console.log("LandingController");
      firebase.auth().onAuthStateChanged(function(user) {
         
        if (user) {
          // User is signed in.
          var usersRef = firebase.database().ref().child('auth/users');
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
        } else {
          // User not signed in.
          $location.path('/login/');
        }
      });
  }

})();