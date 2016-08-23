(function() {

  angular
    .module('app.lesson')
    .controller('LessonController', LessonController);
	
  LessonController.$inject = ['$http','$scope', '$routeParams', '$location', '$firebaseObject', '$sce', 'authService','navBarService', 'commonService'];

  function LessonController($http,$scope, $routeParams, $location, $firebaseObject, $sce, authService, navBarService, commonService) {
	console.log("LessonController");
	var ref = commonService.firebaseRef();
	var modID = $routeParams.modID;
	var qnsID = $routeParams.qnsID;
	
	navBarService.getUserAchievements($scope);
	$scope.answer = "";
	
	//Load Content
	var content =  $firebaseObject(ref.child('pivotalExpert').child('content'));
	content.$loaded().then(function(){
		var courseTitle = content.course.courseTitle;
		var courseContent = content.course.courseContent;
		
		var questions = courseContent[modID].questions[qnsID];

		var user = authService.fetchAuthData();
		user.$loaded().then(function(){
			var currentQnsID = 'C' + modID + 'Q' + qnsID;
			ref.child('userProfiles').child(user.$id).child(courseTitle).child('lastAttempt').set(currentQnsID);
		});
		

		$scope.qnsTitle = questions.qnsTitle;
		$scope.qnsInstruction = questions.qnsInstruction;
		$scope.qnsDescription = questions.qnsDescription;
		var qnsType = questions.qnsType;
		var qns = questions.qns;
		var ans = questions.answer;
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
			$scope.hint = questions.hint;
			if (qnsType.toUpperCase() == 'VIDEO' || qnsType.toUpperCase() == 'SLIDES'){
				correctAns();
				return;
			} else {
				$scope.incorrect = true;
				if (qnsType == 'LSheet') {
					$scope.answer = $scope.answer.toUpperCase();
					validateAnswer();
				} else if (qnsType == 'GSheet') {
			        //https://spreadsheets.google.com/feeds/cells/1cdD1Hna9WyQnhS3QLM_WedsL9Up7x9hLIjvKj0IWTJI/1/public/full?alt=json
			        // what users will submit is: https://docs.google.com/spreadsheets/d/1cdD1Hna9WyQnhS3QLM_WedsL9Up7x9hLIjvKj0IWTJI/edit#gid=0
			        if($scope.answer.indexOf('/edit') != -1) {
			        	$scope.answer = $scope.answer.substring($scope.answer.indexOf('/d/')+3,$scope.answer.indexOf('/edit'));
					}
					else {
						$scope.answer = $scope.answer.substring($scope.answer.indexOf('/d/')+3,$scope.answer.indexOf('/pubhtml'));
					}

			        var answerJsonRequest = 'https://spreadsheets.google.com/feeds/cells/'+$scope.answer+'/1/public/full?alt=json';
			        
			        $http.get(answerJsonRequest)
			        .then(function(response) {
			          $scope.ssjson = response.data;
			          $scope.answerCell = $scope.ssjson.feed.entry[$scope.ssjson.feed.entry.length-1].gs$cell;
			          var row = parseInt($scope.answerCell.row);
			          var col = parseInt($scope.answerCell.col);
			          var inputValue = $scope.answerCell.inputValue;
			          inputValue = getCellRange(inputValue,row,col);
			          $scope.answer = inputValue.toUpperCase();
			          validateAnswer();
			        },
			        function(err) {
				        // Handle error here
				        $scope.hint = "Please make sure your Google Sheet is published!"
				        return;
				    });
				}else if (qnsType == 'mcq') {
					validateAnswer();
				}

				function validateAnswer(){

					if ($scope.answer == ans) {
					
						console.log("Correct Answer");
						$scope.incorrect = false;
						$scope.correct = true;
						$scope.next = function() {correctAns(); };
						return;
					} 
					//else { 
					// 	console.log("Incorrect Answer");
					// 	$scope.hint = questions.hint;
					// 	$scope.incorrect = true;
					// }
					
					if ((qnsType == 'GSheet' || qnsType == 'LSheet') && $scope.incorrect) {
						var inputAns = $scope.answer;
						var validation = questions.checks;
						if(validation) {
							var syntax = validation.syntax;
							//check if any validation to check for
							if(inputAns == "") {
								$scope.validation = "Please enter your answer";
								return;
							}
							if(syntax.length != 0) {
								
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
										$scope.validation = "Input values is missing or incorrect";
										return;
									} else {
										inputAns = inputAns.replace(values[i], "");
									}
								}
								
								if(inputAns.length > 0) {
									$scope.validation = "Too many input values, please check your values again.";
								} else {
									console.log("Correct Answer");
									$scope.answer="";
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
				}
				
			}
		};
		
		//Correct Answer
		function correctAns() {
			var currentDateTime = new Date().toLocaleString("en-US");
			var achievementId = "C" + modID + "Q" + qnsID;
			var user = authService.fetchAuthData();
			//update course progress in firebase db
			ref.child('userProfiles').child(user.$id).child(courseTitle).child('courseProgress').child(achievementId).set(currentDateTime);
			
			//Go to next qns
			var nextQns = courseContent[modID].questions[parseInt(qnsID) + 1];
			if(nextQns) {
				//update last attemp in firebase db
				// var nextQnsID = 'C' + modID + 'Q' + nextQns.qnsId;
				// ref.child('userProfiles').child(user.$id).child(courseTitle).child('lastAttempt').set(nextQnsID);
				//Complete current qns, go to next qns
				$location.path('/lesson/' + nextQns.qnsType + '/' + modID + '/' + nextQns.qnsId);
			} else {
				//Complete current module, go to next module
				nextQns = courseContent[parseInt(modID) + 1];

				if(nextQns) {
					//update last attemp in firebase db
					// var nextQnsID = 'C' + nextQns.moduleID + 'Q0';
					// console.log('lesson/' + nextQns.questions[0].qnsType + '/' + nextQns.moduleID + '/0')
					
					// ref.child('userProfiles').child(user.$id).child(courseTitle).child('lastAttempt').set(nextQnsID);
					//Complete whole course
					$location.path('/lesson/' + nextQns.questions[0].qnsType + '/' + nextQns.moduleID + '/0');
				} else {
					//update last attemp in firebase db
					ref.child('userProfiles').child(user.$id).child(courseTitle).child('lastAttempt').set("completed");
					//Complete whole course
					var displayName= authService.fetchAuthDisplayName();
					displayName.$loaded().then(function(){
						$location.path('/profile/' + displayName.$value);
					});
				}
			}
		};
	});
	
	function getCellRange(inputValue,row,col) {
      var lettersArry = ".ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

      //getting the range out from the value
      var cellsArray = inputValue.split(':');
      var firstCell = cellsArray[0].substring(cellsArray[0].indexOf('R'));
      var firstCellRow = parseInt(firstCell.substring(firstCell.indexOf('[')+1,firstCell.indexOf(']')));
      var firstCellCol = lettersArry[col+parseInt(firstCell.substring(firstCell.lastIndexOf('[')+1,firstCell.lastIndexOf(']')))];
      firstCell = firstCellCol + (firstCellRow+row) ;

      var secondCell = cellsArray[1].substring(0,cellsArray[1].length-1);
      var secondCellRow = parseInt(secondCell.substring(secondCell.indexOf('[')+1,secondCell.indexOf(']')));
      var secondCellCol = lettersArry[col+parseInt(secondCell.substring(secondCell.lastIndexOf('[')+1,secondCell.lastIndexOf(']')))];
      secondCell = secondCellCol + (secondCellRow+row);

      //replaceThis is the previous values
      var replaceThis = inputValue.substring(inputValue.indexOf('R'),inputValue.length-1);
      var withThis = firstCell +':'+secondCell;
      inputValue = inputValue.replace(replaceThis,withThis);
      return inputValue;
    }

  };
})();