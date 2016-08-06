(function() {

  angular
    .module('app.layout')
    .directive('mvLessonVideo', mvLessonVideo);

  function mvLessonVideo() {
    return {
      templateUrl: 'app/lesson/video.html',
      restrict: 'E',
	  //Add controllers method if there any assoicate with it
      controller: VideoController
    };
  }
 
  VideoController.$inject = ['$scope', '$location','$http', '$sce', '$routeParams','authService','navBarService'];
  
  function VideoController($scope, $location, $http, $sce, $routeParams, authService,navBarService) {
    var ref = new Firebase("https://pivotal-expert.firebaseio.com");
	var modID = $routeParams.modID;
	var qnsID = $routeParams.qnsID;
	navBarService.getUserAchievements($scope);
	$http.get('course/content.json').success(function(data) {
		var courseContent = data.course.courseContent;
		var questions = courseContent[modID].questions[qnsID];
		$scope.qnsTitle = questions.qnsTitle;
		$scope.qnsInstruction = questions.qnsInstruction;
		$scope.qnsDescription = questions.qnsDescription;
		
		var qnsType = questions.qnsType;
		var qns = questions.qns;
		$scope.videoLink = $sce.trustAsResourceUrl(qns.link);
		
		//Check if answer is correct
		$scope.submit = function() {
			var achievementId = "C" + modID + "Q" + qnsID;
			var user = authService.fetchAuthData();
			ref.child('userProfiles').child(user.$id).child('courseProgress').child(achievementId).set(true);

			//Go to next qns
			var nextQns = courseContent[modID].questions[parseInt(qnsID) + 1];
			if(nextQns) {
				//Complete current qns, go to next qns
				$location.path('/lesson/' + nextQns.qnsType + '/' + modID + '/' + nextQns.qnsId);
			} else {
				//Complete current module, go to next module
				nextQns = courseContent[parseInt(modID) + 1];
				if(nextQns) {
					//Complete whole course
					$location.path('/lesson/' + nextQns.questions[0].qnsType + '/' + nextQns.moduleID + '/0');
				} else {
					//Complete whole course
					 var username= authService.fetchAuthUsername();
					username.$loaded().then(function(){
						$location.path('/profile/' + username.$value);
					});
				}
			}
		};
		
	});
	
	
  }

})();