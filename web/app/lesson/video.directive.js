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
 
  VideoController.$inject = ['$scope', '$http', '$sce', '$routeParams'];
  
  function VideoController($scope, $http, $sce, $routeParams) {
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
		console.log(qns.link);
		$scope.videoLink = $sce.trustAsResourceUrl(qns.link);
	});

  }

})();