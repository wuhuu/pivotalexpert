(function() {

  angular
    .module('app.layout')
    .directive('mvLessonMcq', mvLessonMcq);

  function mvLessonMcq() {
    return {
      templateUrl: 'app/lesson/mcq.html',
      restrict: 'E',
	  //Add controllers method if there any assoicate with it
	  controller: McqController
    };
  }
 
  McqController.$inject = ['$scope', '$window', '$http', '$routeParams'];
  
  function McqController($scope, $window, $http, $routeParams) {
	var modID = $routeParams.modID;
	var qnsID = $routeParams.qnsID;
	$http.get('course/content.json').success(function(data) {
		console.log("Display Question");
		var lessonContent = data.course.lessonContent;
		var questions = lessonContent[modID].questions[qnsID];
		$scope.qnsTitle = questions.qnsTitle;
		$scope.qnsInstruction = questions.qnsInstruction;
		$scope.qnsDescription = questions.qnsDescription;
		
		var qnsType = questions.qnsType;
		var qns = questions.qns;
		$scope.mcqType = qns.type;
		$scope.options = qns.options;
		var ans = questions.answer;
		
		//Check if answer is correct
		$scope.submit = function() {
			for (var i = 0; i < ans.length; i++) {
				if (this.answer == ans[i]) {
					console.log("Correct Answer");
					alert("Correct");
					$window.location.href = '#/lesson2';
				} else {
					alert("InCorrect");
				}
			}
		};
		
	});
  }  

})();