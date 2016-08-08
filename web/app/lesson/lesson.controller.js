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
			ans = questions.answer;
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
				$scope.answer = $scope.answer.toUpperCase();
				for (var i = 0; i < ans.length; i++) {
					if (this.answer == ans[i]) {
						//correctAns();
						console.log("Correct Answer");
						$scope.incorrect = false;
						$scope.correct = true;
						$scope.next = function() {correctAns(); };
						return;
					} else { 
						console.log("Incorrect Answer");
						$scope.hint = questions.hint;
						$scope.incorrect = true;
					}
				}
				if (qnsType = 'LSheet' && $scope.incorrect) {
						var inputAns = $scope.answer;
						var validation = questions.checks;
						var syntax = validation.syntax;
						//check if any validation to check for
						if(inputAns == "") {
							$scope.validation = "Please enter your answer";
							return;
						}
						if(syntax.length != 0) {
							console.log("TEST" + inputAns);
							
							var explain = validation.explain;
							var values = validation.values;
							for (var i = 0; i < syntax.length; i++) {
								if (inputAns.indexOf(syntax[i]) == -1) {
									$scope.validation = explain[i];
									return;
								} else {
									inputAns = inputAns.replace(syntax[i], "");
								}
							}
							
							for (var i = 0; i < values.length; i++) {
								if (inputAns.indexOf(values[i]) == -1) {
									$scope.validation = "Inpute values is missing or incorrect";
									return;
								} else {
									inputAns = inputAns.replace(values[i], "");
								}
							}
							
							if(inputAns.length > 0) {
								$scope.validation = "Too many input values, please check again your values inputed.";
							} else {
								console.log("Correct Answer");
								$scope.incorrect = false;
								$scope.correct = true;
								$scope.validation = "";
								$scope.hint = "";
								$scope.next = function() {correctAns(); };
								return;
							}
						}
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