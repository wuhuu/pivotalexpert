(function() {

  angular
    .module('app.layout')
    .directive('mvLessonSpreadsheet', mvLessonSpreadsheet);

  function mvLessonSpreadsheet() {
    return {
      templateUrl: 'app/lesson/spreadsheet.html',
      restrict: 'E',
	  //Add controllers method if there any assoicate with it
	  controller: SheetController
    };
  }
 
  SheetController.$inject = ['$scope', '$http', '$routeParams'];
  
  function SheetController($scope, $http, $routeParams) {
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
		var ans = questions.answer;
		
		$scope.sheet = qns.sheet;
		$scope.rowCount = qns.row;
		$scope.colCount = qns.col;
		
		$scope.range = function(min, max, step) {
			// parameters validation for method overloading
			if (max == undefined) {
				max = min;
				min = 0;
			}
			step = Math.abs(step) || 1;
			if (min > max) {
				step = -step;
			}
			// building the array
			var output = [];
			for (var value=min; value<max; value+=step) {
				output.push(value);
			}
			// returning the generated array
			return output;
		};
		
		//Check if answer is correct
		$scope.submit = function() {
			for (var i = 0; i < ans.length; i++) {
				if (this.answer == ans[i]) {
					console.log("Correct Answer");
					alert("Correct");
				}
			}
		};
		
	});
  }  
  

})();