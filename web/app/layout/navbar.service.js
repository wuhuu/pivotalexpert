(function() {

  angular
    .module('app.layout')
    .factory('navBarService', navBarService);

  navBarService.$inject = ['$rootScope','$firebaseObject', '$firebaseAuth','authService', 'commonService'];
  
  function navBarService($rootScope,$firebaseObject, $firebaseAuth, authService, commonService) {
		var ref = commonService.firebaseRef();
		
	   var service = {
	      updateNavBar: updateNavBar,
	      getUserAchievements: getUserAchievements,
		  getCourseTitle: getCourseTitle
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
			var courseTitle = $firebaseObject(getCourseTitle());
			courseTitle.$loaded().then(function(){
				courseTitle = courseTitle.$value;
			
			
				user.$loaded().then(function () {
					var courseProgressRef = ref.child('/userProfiles/' + user.$id + '/courseProgress/');

					courseProgressRef.once('value', function(snapshot) {
					  // The callback function will get called twice, once for "fred" and once for "barney"
					  
					   $scope.$apply(function(){
						$rootScope.numAchievement = snapshot.numChildren();
					   });
					});
				});
			});
		}
		
		function getCourseTitle() {

			var courseTitleRef = ref.child('/pivotalExpert/content/course/courseTitle');
			return courseTitleRef;
		}
  }

})();