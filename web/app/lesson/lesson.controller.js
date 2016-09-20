(function() {

  angular
    .module('app.lesson')
    .controller('LessonController', LessonController);
	
  function LessonController($q, $scope, $routeParams, $location, $firebaseObject, $sce, navBarService) {
	
    console.log("LessonController");
	var ref = firebase.database().ref();
    var user = firebase.auth().currentUser;
	var chapter = $routeParams.chapter;
	var qns = $routeParams.qns;
    var qid = $routeParams.qid;
	
	navBarService.getUserAchievements($scope);
	$scope.answer = "";
	
    
    //Load Question
    var question = $firebaseObject(ref.child('course/questions/' + qid));
    question.$loaded().then(function(){
        //update user last attempt
        ref.child('userProfiles').child(user.uid).child('lastAttempt').set(qid);
        
        //retrieve qns details
        $scope.qnsTitle = question.qnsTitle;
		$scope.qnsInstruction = question.qnsInstruction;
		$scope.qnsDescription = question.qnsDescription;
        $scope.qnsHint = question.hint;
        var qnsType = question.qnsType;
        
        //Video type question
        if(qnsType == 'video'){
            $scope.srclink = $sce.trustAsResourceUrl(question.link);
        }
        
        //Slides type question
        if(qnsType == 'slides'){
           var slides = question.slides;
            
            $scope.currentSlide = 1;
            $scope.totalSlide = slides.length

            $scope.changeSlide = function(changeBy) {
                $scope.currentSlide += changeBy;
                var currentSlide = slides[$scope.currentSlide - 1];
                $scope.srclink = $sce.trustAsResourceUrl(currentSlide.imageLink);
                $scope.explanation = currentSlide.explanation;
            }
            //initial run
            $scope.changeSlide(0);
        }
        
        //MCQ type question
        if(qnsType == 'mcq') {
            
            $scope.questions = question.mcq;
            $scope.currentScore = 0;
            $scope.totalScore = $scope.questions.length;
        }
        
        //Excel type question
        if (qnsType == 'excel') {
            //var sheetID = question.sheetID;
            var sheetID = "test123";

        }
        
        //Codebox type question
        if(qnsType == 'code') {
            var editor = ace.edit("editor");

            editor.setTheme("ace/theme/chrome");
            editor.getSession().setMode("ace/mode/javascript");
            editor.setOption("maxLines", 30);
            editor.setOption("minLines", 10);
            
            //insert code to codebox from firebase
            editor.insert(question.initialCode);
            
            /* Bind to commands
            editor.commands.addCommand({
                name: 'myCommand',
                bindKey: {win: 'Ctrl-Enter',  mac: 'Command-Enter'},
                exec: function(editor) {
                    alert("you have just press CTRL-ENTER")
                },
                readOnly: true // false if this command should not apply in readOnly mode
            });
            */
        }
   
    
        //Submit answer or go next qns
        $scope.submit = function() {

            if (qnsType == 'video' || qnsType == 'slides'){
                nextQns(chapter,qns);
            }
            
            //Load answer key of the question
            var answerKey = $firebaseObject(ref.child('answerKey/' + qid));
            answerKey.$loaded().then(function(){
                
                //MCQ question type
                if (qnsType == 'mcq'){
                    $scope.checked = true;
                    console.log("MCQ TEST");
                    $scope.currentScore = 0;
                    for (i = 0; i < $scope.totalScore; i++) { 
                        var result = $scope.questions[i].qnsID == answerKey.answer[i];
                        $scope.questions[i].qnsID = result;
                        //increase score if correct
                        if(result) {
                            $scope.currentScore += 1;
                        }
                    }
                    //all correct, go to next qns
                    if($scope.currentScore == $scope.totalScore) {
                        nextQns(chapter,qns);
                    }
                }
                
                //Excel question type
                if (qnsType == 'excel') {
                    
                }
                
                //Codebox question type
                if (qnsType == 'code') {
                    // Check for syntax error
                    var annot = editor.getSession().getAnnotations();
                    if (annot.length == 0) {
                        var input = editor.getValue().replace(/\s+/g, " ");

                        var code = answerKey.testcodeDeclare + input + answerKey.testcode;
                        console.log(code);
                        $scope.testCase = answerKey.testcase;
                        var totalTestNum =  $scope.testCase.length;
    
                        var promises = [];
                        console.log("TEST " + totalTestNum);
                        console.log($scope.testCase);
                        for (i = 0; i < totalTestNum; i++) { 
                            var test =  $scope.testCase[i];
                            var ww = new Worker(getInlineJSandTest(test, code));
                            //Send any message to worker
                            ww.postMessage("and message");
                            ww.onmessage = function (e) {
                                var msg = e.data;
                                console.log("Message from worker--> ",msg);
                                promises.push(msg);
                            };
                        }
                        $q.all(promises).then(function() {
                            console.log("RESULT");
                            console.log(promises);
                            //console.log(promises[0]);
                        });

/*                        
                        $scope.$watch('applied', function() {
                            console.log("TESTING");
                            console.log($scope.result);
                            if($scope.result) {
                                nextQns(chapter,qns);
                            }
                        });
*/
                    } else {
                        $scope.incorrect = true;
                        $scope.errMsg = "Error with the syntax. Please check your answer again."
                    }
                }
            });
        }
    });
    
    
    //ERROR
    function nextQns(currentChapter, currentQns){
        var courseSeq = $firebaseObject(ref.child('courseSequence'));
        courseSeq.$loaded().then(function() {
            var nextQns = courseSeq[currentChapter].qns[parseInt(currentQns) + 1];
            if(nextQns) {
				$location.path('/lesson/' + nextQns.qnsType + '/' + currentChapter + '/' + (parseInt(currentQns) + 1) + '/' + nextQns.qnsId);
			} else {
				//Complete current module, go to next module
				nextQns = courseSeq[parseInt(currentChapter) + 1].qns[1];
				if(nextQns) {
					$location.path('/lesson/' + nextQns.qnsType + '/' + (parseInt(currentChapter) + 1) + '/1/'+ nextQns.qnsId );
				} else {
					//update last attemp in firebase db
					ref.child('userProfiles').child(user.uid).child('lastAttempt').set("completed");
					//Complete whole course
					var userRef = $firebaseObject(ref.child('auth/users/' + user.uid));
					userRef.$loaded().then(function(){
						$location.path('/profile/' + userRef.profileLink);
					});
				}
			}
        });
    }

	var getInlineJSandTest = function (test, code) {
		var top = 'onmessage = function(msg){';
		var bottom = 'postMessage(result);};';

		var all = test +"\n\n"+top+"\n"+code+"\n"+bottom+"\n"
		var blob = new Blob([all], {"type": "text\/plain"});
		return URL.createObjectURL(blob);
	}

    function loadSheetsApi() {
        var discoveryUrl = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
        
        //gapi.client.load(discoveryUrl).then(loadQn);
    }
    
    //Haven Load Qns
    //What i need from firebase :
    // {Edu spreadsheetId(from auth/user), sheetID(from course/question). 
    // Sudent spreadsheetId(from auth/user), sheetID(copy from edu)}
    
    function loadQn() {
        var sheetId1 ;
        gapi.client.sheets.spreadsheets.sheets.copyTo({
          spreadsheetId: '18xco1vxDl2I8ZcLVu20lpzHT20NHF-GnD2Pm6ACV-Lw',
          sheetId: 0,
          destinationSpreadsheetId: '1-EKjGfGa7j8cmLkDROLzj2wgeJdJctGssnhXEIzhskg',
        }).then(function(response) {
          appendPre('Success 1' );
          sheetId1 = response.result.sheetId;//
          gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: '1-EKjGfGa7j8cmLkDROLzj2wgeJdJctGssnhXEIzhskg',
            requests: [
              {
                updateSheetProperties:{
                  properties:{
                    title: "Question 1",
                    sheetId: sheetId1
                  },
                  fields: "title"
                }
              }
            ]
          }).then(function(response){

          });

        }, function(response) {
          appendPre('Error: ' + response.result.error.message);
        });
    }

    /*
	//Load course
	var course =  $firebaseObject(ref.child('course'));
	content.$loaded().then(function(){
		var courseContent = content.course.courseContent;
		
		var questions = courseContent[courseID].questions[qnsID];

		var user = authService.fetchAuthData();
		user.$loaded().then(function(){
			var currentQnsID = 'C' + courseID + 'Q' + qnsID;
			ref.child('userProfiles').child(user.$id).child('lastAttempt').set(currentQnsID);
		});
		

		$scope.qnsTitle = questions.qnsTitle;
		$scope.qnsInstruction = questions.qnsInstruction;
		$scope.qnsDescription = questions.qnsDescription;
		var qnsType = questions.qnsType;
		var qns = questions.qns;
		var ans = questions.answer;
		var answerCells = questions.answerCells;
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
			          var studentAnswercells = {};
			          var lettersArry = ".ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
			          $scope.ssjson.feed.entry.forEach(function(entry){
			          	var col = parseInt(entry.gs$cell.col);
			          	var row = parseInt(entry.gs$cell.row);
						var cell = lettersArry[col]+row;

						if(answerCells.hasOwnProperty(cell)) {
							studentAnswercells[cell] = getCellRange(entry.gs$cell.inputValue,row,col);
						}

			          });

			          // get specific answercell from firebase.
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
			ref.child('userProfiles').child(user.$id).child('courseProgress').child(achievementId).set(currentDateTime);
			
			//Go to next qns
			var nextQns = courseContent[modID].questions[parseInt(qnsID) + 1];
			if(nextQns) {
				
				$location.path('/lesson/' + nextQns.qnsType + '/' + modID + '/' + nextQns.qnsId);
			} else {
				//Complete current module, go to next module
				nextQns = courseContent[parseInt(modID) + 1];

				if(nextQns) {
					
					$location.path('/lesson/' + nextQns.questions[0].qnsType + '/' + nextQns.moduleID + '/0');
				} else {
					//update last attemp in firebase db
					ref.child('userProfiles').child(user.$id).child('lastAttempt').set("completed");
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
      if(cellsArray.length == 1) {
      	return cellsArray[0];
      }
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
    */

  };
})();