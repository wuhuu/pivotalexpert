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
            // testImage(userData.pic).then(
            //     function fulfilled(img) {
            //           $scope.displayPic = $sce.trustAsUrl(userData.pic);
            //           navBarService.updateDisplayPic($scope.displayPic);
            //     },

            //     function rejected() {
            //           $scope.displayPic = $sce.trustAsUrl("../content/images/photo.jpg");
            //           navBarService.updateDisplayPic($scope.displayPic);
            //     }

            // );
            navBarService.updateDisplayPic(userData.pic);
            $scope.profileLink =  userData.profileLink;
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

  function testImage(url) {

      // Define the promise
      const imgPromise = new Promise(function(resolve, reject) {

          // Create the image
          const imgElement = new Image();

          // When image is loaded, resolve the promise
          imgElement.addEventListener('load', function imgOnLoad() {
              resolve(this);
          });

          // When there's an error during load, reject the promise
          imgElement.addEventListener('error', function imgOnError() {
              reject();
          })

          // Assign URL
          imgElement.src = url;

      });

      return imgPromise;
  }

})();
