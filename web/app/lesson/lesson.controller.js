(function() {

  angular
    .module('app.lesson')
    .controller('LessonController', LessonController);
	
  LessonController.$inject = ['$scope', '$routeParams', '$location', '$http', '$sce', 'authService','navBarService'];

  function LessonController($scope, $routeParams, $location, $http, $sce, authService, navBarService) {
	console.log("LessonController");
	var ref = new Firebase("https://pivotal-expert.firebaseio.com");
	var modID = $routeParams.modID;
	var qnsID = $routeParams.qnsID;
	
	navBarService.getUserAchievements($scope);
	$scope.answer = "";
	
	$http.get('course/content.json').success(function(data) {
		var courseContent = data.course.courseContent;
		var questions = courseContent[modID].questions[qnsID];
		$scope.qnsTitle = questions.qnsTitle;
		$scope.qnsInstruction = questions.qnsInstruction;
		$scope.qnsDescription = questions.qnsDescription;
		
		var qnsType = questions.qnsType;
		var qns = questions.qns;
		var ans = null;
		// video or slides Qns type
		if (qnsType == 'video' || qnsType == 'slides'){
			$scope.srclink = $sce.trustAsResourceUrl(qns.link);
		}

		// MCQ Qns type
		if (qnsType == 'mcq'){
			
			$scope.mcqType = qns.type;
			$scope.options = qns.options;
		}
		
		// Local Spreadsheet Qns type
		if (qnsType == 'LSheet') {
			ans = questions.answer;
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
		}
		
		
		//Check if answer is correct
		$scope.submit = function() {
			if (qnsType == 'video' || qnsType == 'slides'){
				correctAns();
			} else {
				if(qnsType == 'mcq') {
					$scope.answer = $scope.answer.toUpperCase();
					for (var i = 0; i < ans.length; i++) {
						if (this.answer == ans[i]) {
							//correctAns();
							console.log("Correct Answer");
							$scope.incorrect = false;
							$scope.correct = true;
							$scope.next = function() {correctAns(); };
						} else { 
							$scope.hint = questions.hint;
							$scope.incorrect = true;
						}
					}
				}
				if(qnsType == 'LSheet') {
					$scope.answer = $scope.answer.toUpperCase();
					var validation = questions.checks;
					var syntax = validation.syntax;
					var explain = validation.explain;
					var values = validation.values;
					console.log(syntax);
					console.log(explain);
					console.log(values);
					
				}
			}
		};
		
		//Correct Answer
		function correctAns() {
			var currentDateTime = new Date().toLocaleString("en-US");
			var achievementId = "C" + modID + "Q" + qnsID;
			var user = authService.fetchAuthData();
			//update course progress in firebase db
			ref.child('userProfiles').child(user.$id).child('courseProgress').child(achievementId).set(currentDateTime);
			
			//Go to next qns
			var nextQns = courseContent[modID].questions[parseInt(qnsID) + 1];
			if(nextQns) {
				//update last attemp in firebase db
				var nextQnsID = 'C' + modID + 'Q' + nextQns.qnsId;
				ref.child('userProfiles').child(user.$id).child('lastAttempt').set(nextQnsID);
				//Complete current qns, go to next qns
				$location.path('/lesson/' + nextQns.qnsType + '/' + modID + '/' + nextQns.qnsId);
			} else {
				//Complete current module, go to next module
				nextQns = courseContent[parseInt(modID) + 1];
				if(nextQns) {
					//update last attemp in firebase db
					var nextQnsID = 'C' + nextQns.moduleID + 'Q0';
					ref.child('userProfiles').child(user.$id).child('lastAttempt').set(nextQnsID);
					//Complete whole course
					$location.path('/lesson/' + nextQns.questions[0].qnsType + '/' + nextQns.moduleID + '/0');
				} else {
					//update last attemp in firebase db
					ref.child('userProfiles').child(user.$id).child('lastAttempt').set("completed");
					//Complete whole course
					var username= authService.fetchAuthUsername();
					username.$loaded().then(function(){
						$location.path('/profile/' + username.$value);
					});
				}
			}
		};
	});
	
  };
})();