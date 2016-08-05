(function() {

  angular
    .module('app.coursemap')
    .controller('CoursemapController', CoursemapController);

  CoursemapController.$inject = ['$scope','$http', '$firebaseObject', 'authService'];

  function CoursemapController($scope, $http, $firebaseObject, authService) {
    console.log("Coursemap Page");
	var user = authService.fetchAuthData();
	var courseProgressRef = new Firebase('https://pivotal-expert.firebaseio.com/userProfiles/'+user.$id+'/courseProgress/');	
	var list = [];

	courseProgressRef.once('value', function(snapshot) {
	  snapshot.forEach(function(childSnapshot) {
		var key = childSnapshot.key();
		list.push(key);
		});
			
		$scope.complete = function (moduleID,qnsId) {
			var course = 'C' + moduleID + 'Q' + qnsId;
			return list.indexOf(course) > -1;
		};
		 // Retrieve from json
		$http.get('course/content.json').success(function(data) {
			$scope.courseTitle = data.course.courseTitle;
			$scope.courseLogo = data.course.courseLogo;
			$scope.courseDesc = data.course.courseDescription;
			$scope.courseMap = data.course.courseMap;
		});
	});



	  
  }

})();