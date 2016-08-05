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
 
  NavbarController.$inject = ['$firebaseObject','$scope', '$location','authService'];

  function NavbarController($firebaseObject,$scope,$location, authService) {
      //Retrieve User Display Name
	  var user = authService.fetchAuthData();
	  var userpic = authService.fetchAuthPic();
	  console.log("Nav Bar");
	  if (user != null) {
	  	$scope.logined= true;
		user.$loaded().then(function(){
		 var username= authService.fetchAuthUsername();
		 	username.$loaded().then(function(){
				$scope.displayName = username.$value;
				
			});
		   getUserAchievements(user.$id);
	    });
		  userpic.$loaded().then(function(){
		  $scope.displayPic = userpic.$value;
	    });
	  } else {
		$scope.logined= false;
		//$location.path('/login/');
	  }

	  $scope.logout = function () {
	  $scope.logined= false;
	  authService.logout();
	  $location.path('/');
	  window.location.reload();
	}

	function getUserAchievements(uid) {
		var list = [];

		var courseProgressRef = new Firebase('https://pivotal-expert.firebaseio.com/userProfiles/'
			+uid+'/courseProgress/');

		courseProgressRef.once('value', function(snapshot) {
		  // The callback function will get called twice, once for "fred" and once for "barney"
		  snapshot.forEach(function(childSnapshot) {
		    // key will be "fred" the first time and "barney" the second time
		    var key = childSnapshot.key();
		    list.push(key);
		    // childData will be the actual contents of the child
		    //var childData = childSnapshot.val();
			});
		  
		  $scope.$apply(function(){
		  	$scope.list = list;
		  });
		});
  	}
  }

  
  

})();