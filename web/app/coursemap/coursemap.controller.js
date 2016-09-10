(function() {

  angular
    .module('app.coursemap')
    .controller('CoursemapController', CoursemapController);

  CoursemapController.$inject = ['$scope', '$firebaseObject', 'authService', 'commonService', 'navBarService'];

  function CoursemapController($scope, $firebaseObject, authService, commonService, navBarService) {
    console.log("Coursemap Page");
	var user = authService.fetchAuthData();
	var ref = commonService.firebaseRef();
	

	
	var courseProgressRef = ref.child('/userProfiles/' + user.$id + '/courseProgress/');
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
	
	
		 // Retrieve from content
		var content =  $firebaseObject(ref.child('pivotalExpert').child('content'));
		content.$loaded().then(function(){
			$scope.courseTitle = content.course.courseTitle;
			$scope.courseLogo = content.course.courseLogo;
			$scope.courseDesc = content.course.courseDescription;
			$scope.courseMap = content.course.courseMap;
		});
	});

  }

})();