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
 
  NavbarController.$inject = ['$firebaseObject','$scope', '$rootScope', '$location','authService', 'navBarService'];

  function NavbarController($firebaseObject,$scope, $rootScope,$location, authService, navBarService) {
	  console.log("NavbarController");
	  //Retrieve User Display Name
	  var user = authService.fetchAuthData();
	  var userpic = authService.fetchAuthPic();
	  
	  if (user != null) {
	  	$scope.logined= true;
		user.$loaded().then(function(){
		 // var username= authService.fetchAuthUsername();
		 // 	username.$loaded().then(function(){
			// 	$scope.displayName = username.$value;
			// });
			$scope.displayName = user.profileLink;
			navBarService.getUserAchievements($scope);
	    });
		  userpic.$loaded().then(function(){
		  $scope.displayPic = userpic.$value;
	    });
	  } else {
		$scope.logined = false;
		//$location.path('/login/');
	  }
	
	  var courseTitle = $firebaseObject(navBarService.getCourseTitle());
		courseTitle.$loaded().then(function(){
			$scope.courseTitle = courseTitle.$value;
	  });
	  $scope.logout = function () {
		  $scope.logined= false;
		  authService.logout();
		  $location.path('/login');
		  window.location.reload();
	}
	
  }



})();