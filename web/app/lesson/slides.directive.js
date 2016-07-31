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
 
  SlidesController.$inject = ['$scope', '$http', '$sce', '$routeParams'];
  
  function SlidesController($scope, $http, $sce, $routeParams) {
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
	});

  }

})();