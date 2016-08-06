(function() {

  angular
    .module('app.layout')
    .factory('navBarService', navBarService);

  navBarService.$inject = ['$firebaseArray', '$firebaseObject','authService'];
  
  function navBarService($firebaseObject, $firebaseAuth, authService) {
	   
	   var service = {
	      updateNavBar: updateNavBar,
	      getUserAchievements: getUserAchievements
	    };
	
		return service;

	   	function updateNavBar($scope,newName) {
	      //Retrieve User Display Name
		  var user = authService.fetchAuthData();
		  $scope.displayName = newName;
		  user.$loaded().then(function () {
	        $scope.displayName = user.displayName;
	        $getUserAchievements(user$id);
	      });
	  	}

	  	function getUserAchievements(uid,$scope) {
		var list = [];

		var courseProgressRef = new Firebase('https://pivotal-expert.firebaseio.com/userProfiles/'
			+uid+'/courseProgress/');

		courseProgressRef.once('value', function(snapshot) {
		  // The callback function will get called twice, once for "fred" and once for "barney"
		  $scope.numAchievement = snapshot.numChildren();
		  // $scope.$apply(function(){
		  	
		  // });
		});
  	}
  }

})();