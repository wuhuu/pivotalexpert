(function() {

  angular
    .module('app.layout')
    .factory('navBarService', navBarService);

  navBarService.$inject = ['$rootScope','$firebaseArray', '$firebaseObject','authService'];
  
  function navBarService($rootScope,$firebaseObject, $firebaseAuth, authService) {
	   
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
	        getUserAchievements($scope);
	      });
	  	}

	  	function getUserAchievements($scope) {
			var user = authService.fetchAuthData();
			
			user.$loaded().then(function () {
				var courseProgressRef = new Firebase('https://pivotal-expert.firebaseio.com/userProfiles/'
										+user.$id+'/courseProgress/');

				courseProgressRef.once('value', function(snapshot) {
				  // The callback function will get called twice, once for "fred" and once for "barney"
				  
				   $scope.$apply(function(){
				  	$rootScope.numAchievement = snapshot.numChildren();
				   });
				});
		  	});
		}
  }

})();