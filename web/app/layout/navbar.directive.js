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
 
  function NavbarController($firebaseObject, $scope, $rootScope, $location, authService, navBarService, commonService) {
      
      var usersRef = firebase.database().ref().child('auth/users');
      
      $scope.login = function () {
          console.log("Logging in");
	      authService.login();      
      }
      
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in.
          navBarService.updateNavBar();
          $scope.displayPic = user.photoURL;
          $rootScope.logined = true;
          
          //Check whether login user email belong to admin account email
          var adminEmail = commonService.getAdminEmail().toUpperCase();

           var userData = $firebaseObject(usersRef.child(user.uid));
          //navBarService.updateNavBar(user.displayName);
          userData.$loaded().then(function(){
            $scope.profileLink = userData.profileLink;
            //check if admin role
            if(adminEmail.toUpperCase() === userData.email.toUpperCase()) {
                $rootScope.isAdmin = true;
            }
            
          });
        } 
      });
      
      
    $rootScope.courseTitle = commonService.getCouseName();
      
    $scope.logout = function () {
        $scope.logined = false;
        authService.logout();
        $location.path('/login');
        window.location.reload();
	}
	
  }



})();