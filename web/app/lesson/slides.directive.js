(function() {

  angular
    .module('app.layout')
    .directive('mvLessonSlides', mvLessonSlides);

  function mvLessonSlides() {
    return {
      templateUrl: 'app/lesson/slides.html',
      restrict: 'E',
	  //Add controllers method if there any assoicate with it
      controller: SlidesController
    };
  }
 
  SlidesController.$inject = ['$scope', '$window','$http', '$sce', '$routeParams','authService'];
  
  function SlidesController($scope, $window, $http, $sce, $routeParams, authService) {
	var ref = new Firebase("https://pivotal-expert.firebaseio.com");
  	var modID = $routeParams.modID;
	var qnsID = $routeParams.qnsID;
	
	$http.get('course/content.json').success(function(data) {
		var lessonContent = data.course.lessonContent;
		var questions = lessonContent[modID].questions[qnsID];
		$scope.qnsTitle = questions.qnsTitle;
		$scope.qnsInstruction = questions.qnsInstruction;
		$scope.qnsDescription = questions.qnsDescription;
		
		var qnsType = questions.qnsType;
		var qns = questions.qns;
		$scope.slideLink = $sce.trustAsResourceUrl(qns.link);
		
		//Check if answer is correct
		$scope.submit = function() {
			var achievementId = "C" + modID + "Q" + qnsID;
			var user = authService.fetchAuthData();
			ref.child('pivotalExpert').child('PEProfile').child(user.$id).child('courseProgress').child(achievementId).set(true);
			$window.location.href = '#/';
		};
	});

  }

})();