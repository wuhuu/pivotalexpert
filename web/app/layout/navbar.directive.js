(function() {

  angular
    .module('app.layout')
    .directive('mvNavbar', mvNavbar);

  function mvNavbar() {
    return {
      templateUrl: 'app/layout/navbar.html',
      restrict: 'E',
	  //Add controllers method if there any assoicate with it
	  controller: NavbarController
	  
    };
  }
 
 
  function NavbarController($firebaseObject, $scope, $location, authService, navBarService) {
      
      var usersRef = firebase.database().ref().child('auth/users');
      
      $scope.login = function () {
          console.log("Logging in");
	      authService.login();      
      }
      
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in.
          navBarService.getUserAchievements($scope);
          $scope.displayPic = user.photoURL;
          $scope.logined = true;
           var userData = $firebaseObject(usersRef.child(user.uid));
          //navBarService.updateNavBar(user.displayName);
          userData.$loaded().then(function(){
            $scope.displayName = userData.profileLink;
          });
        } 
      });
      
	  var courseTitle = $firebaseObject(navBarService.getCourseTitle());
		courseTitle.$loaded().then(function(){
			$scope.courseTitle = courseTitle.$value;
	  });
      
	  $scope.logout = function () {
		  $scope.logined = false;
		  authService.logout();
		  $location.path('/login');
		  window.location.reload();
	}
	
  }



})();