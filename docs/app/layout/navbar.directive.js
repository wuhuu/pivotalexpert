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

  function NavbarController($firebaseObject, $scope, $rootScope, $location, $sce, authService, navBarService, commonService) {
      var ref = firebase.database().ref();
      var usersRef = ref.child('auth/users');
      var adminRef = ref.child('auth/admin');
      var feedbackRef =  ref.child('settings/feedback');

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

          //Check if feedbackLink already exist
            var feedback = $firebaseObject(feedbackRef);
            feedback.$loaded().then(function(){
                if(feedback.$value) {
                    $rootScope.haveFeedback = true;
                }
            });
          var userData = $firebaseObject(usersRef.child(user.uid));
          userData.$loaded().then(function(){
            $scope.profileLink =  $sce.trustAsResourceUrl(userData.profileLink);
          });
        }
      });


    $rootScope.courseTitle = courseName;

    $scope.logout = function () {
        $scope.logined = false;
        authService.logout();
        $location.path('/login');
        window.location.reload();
	}

  }



})();
