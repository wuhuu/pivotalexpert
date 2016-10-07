(function() {

  angular
    .module('app.lesson')
    .controller('LessonController', LessonController);

  function LessonController($q, $scope,$mdDialog, $routeParams, $location, $firebaseObject, $sce, navBarService, commonService) {

    console.log("LessonController");

	var ref = firebase.database().ref();
    var user = firebase.auth().currentUser;
	var chapter = $routeParams.chapter;
	var qns = $routeParams.qns;
    var qid = $routeParams.qid;

	navBarService.updateNavBar();

	$scope.answer = "";
    function showCompleteDialog(msg) {
      var confirm = $mdDialog.confirm()
          .title('Challenge Completed!')
          .textContent(msg)
          .ok('Next Challenge');

        $mdDialog.show(confirm).then(function() {
            nextQns(chapter,qns);
        });
    }
    //Load Question
    var question = $firebaseObject(ref.child('course/questions/' + qid));
    question.$loaded().then(function(){
        //update user last attempt
        user = firebase.auth().currentUser;
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

            var mcq = question.mcq;

            $scope.currentMCQ = 1;
            $scope.totalMCQ = mcq.length
            var answerKey = $firebaseObject(ref.child('answerKey/' + qid));
            
            //MCQ validation
            $scope.changeMCQ = function(changeBy) {
               answerKey.$loaded().then(function() {
                   if($scope.questions[$scope.currentMCQ-1].qnsID === answerKey.answer[$scope.currentMCQ-1]) {
                        if($scope.currentMCQ === $scope.totalMCQ) {
                           //nextQns(chapter,qns);
                           showCompleteDialog("You have completed the MCQ Challenge, go for the next challenge!");
                        }else {                       
                            $scope.currentMCQ += changeBy;
                            $scope.mcq = mcq[$scope.currentMCQ - 1];
                        }
                    }else {
                        $scope.mcq = mcq[0];
                        $scope.currentMCQ = 1;
                        commonService.showSimpleToast("Incorrect, try again!");
                    }
               }); 
            }
            //initial run
            $scope.mcq = mcq[0];
        }

        //Excel type question
        if (qnsType == 'excel') {
            //load qns sheet ID
            $scope.sheetID = question.sheetID;

            //load admin
            var adminID = $firebaseObject(ref.child('auth/admin/admin'));
            adminID.$loaded().then(function(){
                //load admin spreadsheetId
                var adminUser = $firebaseObject(ref.child('auth/users/' + adminID.$value));
                adminUser.$loaded().then(function(){
                    $scope.eduExcelID = adminUser.eduSheet;

                    //load user spreadsheetId
                    var currentUser = $firebaseObject(ref.child('auth/users/' + user.uid));
                    currentUser.$loaded().then(function(){

                        $scope.userExcelID = currentUser.driveExcel;
                        //$scope.userSheetID = currentUser.sheetID; //Currently not in use
                        $scope.token = currentUser.access_token;

                        gapi.auth.setToken({
                            access_token: $scope.token
                        });

                        var discoveryUrl = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
                        //Delete all sheet except for instruction

                        gapi.client.load(discoveryUrl).then(function() {
                            getAllSheets().then(function(result) {
                                removeAllSheets(result).then(function(){
                                    copyQnsFromEdu().then(function(result) {
                                        updateSheetTitle().then(function(result) {
                                            var excelLink = "https://docs.google.com/spreadsheets/d/" + $scope.userExcelID + "/edit#gid=" + $scope.sheetId1;
                                            $scope.srclink = $sce.trustAsResourceUrl(excelLink);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
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

        //Submit answer and go next qns if correct
        $scope.submit = function() {
            $scope.checkingAns = true;
            //Load answer key of the question
            var answerKey = $firebaseObject(ref.child('answerKey/' + qid));
            answerKey.$loaded().then(function(){

                //video and slides question type
                if (qnsType == 'video' || qnsType == 'slides'){
                    commonService.showSimpleToast("Time to applied what you have learnt!");
                    nextQns(chapter,qns);
                }

                //mcq question type
                if (qnsType == 'mcq'){
                    $scope.checked = true;
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
                        commonService.showSimpleToast("Excellent!! You have completed the MCQ");
                    }
                }

                //excel question type
                if (qnsType == 'excel') {

                    gapi.auth.setToken({
                        access_token: $scope.token
                    });
                    $scope.range = answerKey.range;
                    $scope.formulaAnswer = answerKey.formulaAnswer;
                    $scope.valueAnswer = answerKey.valueAnswer;

                    var discoveryUrl = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
                    gapi.client.load(discoveryUrl).then(function() {
                        checkCellFormula().then(function(result) {
                            if(result.indexOf(false) === -1 && result.indexOf('false') === -1) {
                                checkCellValue().then(function(result){
                                    if (result.indexOf(false) === -1 && result.indexOf('false') === -1) {
                                        deleteCurrentSheet().then(function() {
                                            nextQns(chapter,qns);
                                            commonService.showSimpleToast("AWESOME!! You have completed the EXCEL Question");
                                        });

                                    } else {
                                        $scope.incorrect = true;
                                        $scope.checkingAns = false;
                                    }
                                });
                            } else {
                                $scope.incorrect = true;
                                $scope.checkingAns = false;
                            }
                        });
                    });
                }

                //code question type
                if (qnsType == 'code') {
                    // Check for syntax error
                    var editor = ace.edit("editor");
                    var annot = editor.getSession().getAnnotations();
                    if (annot.length == 0) {
                        var code = editor.getValue();
                        //console.log(code);
                        $scope.codeResult = [];
                        $scope.hints = [];
                        var errorHints =[];
                        var promises = []
                        var totalTestNum = answerKey.testcases.length;

                        for (i = 0; i < totalTestNum; i++) {
                            var test =  answerKey.testcases[i];

                            //Run Test case
                            runTestcase(test, code).then(function(result) {
                                $scope.codeResult.push(result);
                                //When end of test case
                                if($scope.codeResult.length === totalTestNum){
                                    if ($scope.codeResult.indexOf(false) === -1) {
                                        nextQns(chapter,qns);
                                        commonService.showSimpleToast("FANTASTIC!! You have completed the code Question");
                                    } else {
                                        $scope.incorrect = true;
                                        var hint = "";
                                        for (a = 0; a < $scope.hints.length ; a++){
                                          var hintNo = a + 1;
                                          hint = hint + hintNo + " " + $scope.hints[a] + "\n\r";
                                        }
                                        $scope.qnsHint = hint;
                                    }
                                }
                            });
                        }

                    } else {
                        $scope.incorrect = true;
                        $scope.errMsg = "Error with the syntax. Please check your answer again."
                    }
                }
            });
        }
    });

    function getAllSheets() {
        var deferred = $q.defer();
        gapi.client.sheets.spreadsheets.get({
          spreadsheetId: $scope.userExcelID
        }).then(function(response) {
          var sheets = response.result.sheets;
          var sheetsToBeDelete = [];

          for (i = 0; i < sheets.length; i++) {
            var sheetId = sheets[i].properties.sheetId;
            if ( sheetId != 0) {
                sheetsToBeDelete.push(sheetId);
            }

            if(i == (sheets.length - 1)) {
                deferred.resolve(sheetsToBeDelete);
            }
          }
        });
        return deferred.promise;
    }

    function removeAllSheets(sheetsToBeDelete) {
        var deferred = $q.defer();
        var sheets = sheetsToBeDelete;

        for (i = 0; i < sheets.length; i++) {
          var sheetId = sheets[i];
          if ( sheetId != 0) {
            gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: $scope.userExcelID,
                requests: [
                  {
                    deleteSheet:{
                      sheetId: sheetId
                    }
                  }
                ]
            }).then(function(response) {
                console.log("Sheet Deleted");
            });
          }
          if(i == (sheets.length - 1)) {
              deferred.resolve(true);
          }
        }
        if(sheets.length === 0) {
              deferred.resolve(true);
        }

        return deferred.promise;
    }

    function copyQnsFromEdu() {
        var deferred = $q.defer();
        gapi.client.sheets.spreadsheets.sheets.copyTo({
          spreadsheetId: $scope.eduExcelID,
          sheetId: $scope.sheetID,
          destinationSpreadsheetId: $scope.userExcelID,
        }).then(function(response) {

          $scope.sheetId1 = response.result.sheetId;
          //update user sheetID - Currently not in use
          //ref.child("/auth/users/" + user.uid).update({ sheetID: $scope.sheetId1 });
          deferred.resolve(true);

        });
        return deferred.promise;
    }

    function updateSheetTitle() {
        var deferred = $q.defer();
        gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: $scope.userExcelID,
            requests: [
              {
                updateSheetProperties:{
                  properties:{
                    title: $scope.qnsTitle,
                    sheetId: $scope.sheetId1
                  },
                  fields: "title"
                }
              }
            ]
          }).then(function(response) {
            deferred.resolve(true);
        });
        return deferred.promise;
    }


    function checkCellFormula() {
      var deferred = $q.defer();
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: $scope.userExcelID,
        range: $scope.qnsTitle + "!" + $scope.range,
        valueRenderOption:"FORMULA"
      }).then(function(response) {

        $scope.formulaResult = []
        if($scope.formulaAnswer) {
            var totalTestNum =  $scope.formulaAnswer.length;
            for (i = 0; i < totalTestNum; i++) {
                var cell = $scope.formulaAnswer[i].cell;
                var functionName = $scope.formulaAnswer[i].functionName;

                var col = sheetColMapping(cell.charAt(0).toUpperCase()) - 1;
                var row = parseInt(cell.substring(1)) - 1;

                var formula = String(response.result.values[parseInt(row)][parseInt(col)]);

                $scope.formulaResult.push(formula.toUpperCase().indexOf(functionName.toUpperCase()) !== -1);
            }
        }
        deferred.resolve($scope.formulaResult);

      });
      return deferred.promise;
    }

    function checkCellValue() {
      var deferred = $q.defer();
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: $scope.userExcelID,
        range: $scope.qnsTitle + "!" + $scope.range
      }).then(function(response) {

        $scope.valueResult = []
        if($scope.formulaAnswer) {
            var totalTestNum =  $scope.valueAnswer.length;
            for (i = 0; i < totalTestNum; i++) {
                var cell = $scope.valueAnswer[i].cell;
                var answer = $scope.valueAnswer[i].value;

                var col = sheetColMapping(cell.charAt(0).toUpperCase()) - 1;
                var row = parseInt(cell.substring(1)) - 1;
                var valueRow = response.result.values[parseInt(row)];
                if(valueRow) {
                    value = valueRow[parseInt(col)];
                    $scope.valueResult.push(value === answer);
                } else {
                    $scope.valueResult.push(false);
                }

            }
        }
        deferred.resolve($scope.valueResult);
      });

      return deferred.promise;
    }

    function deleteCurrentSheet() {
        var deferred = $q.defer();
        gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: $scope.userExcelID,
            requests: [
              {
                deleteSheet:{
                    sheetId: $scope.sheetId1
                }
              }
            ]
        }).then(function(response) {
            deferred.resolve(true);

        });
      return deferred.promise;
    }

    function runTestcase(test, code) {

        var deferred = $q.defer();
        var ww = new Worker(getInlineJSandTest(test, code));
        //Send any message to worker
        ww.postMessage("and message");
        ww.onmessage = function (e) {
            var msg = e.data;
            //check if there failed result
            deferred.resolve(msg);
            if(msg == false){
              $scope.hints.push(test.hint);
            }
        };
        return deferred.promise;
    }

    function getInlineJSandTest (test, code) {
		var top = 'onmessage = function(msg){';
		var bottom = 'postMessage(result);};';
    var newTest = "var result = " + test.expect + " == " + test.toEqual +";";
		var all = code +"\n\n"+top+"\n"+newTest+"\n"+bottom+"\n"
    console.log(all);
		var blob = new Blob([all], {"type": "text\/plain"});
		return URL.createObjectURL(blob);
	}

    function nextQns(chapter, question){

        //update course progress in firebase db
        var dateTimeNow = new Date().toLocaleString("en-US");
        var userAchievementRef = ref.child('userProfiles').child(user.uid).child('courseProgress').child(qid);
        userAchievementRef.update({ "completedAt": firebase.database.ServerValue.TIMESTAMP, "text": dateTimeNow});

        chapter = parseInt(chapter) - 1;
        question = parseInt(question);

        var courseSeq = $firebaseObject(ref.child('courseSequence'));
        courseSeq.$loaded().then(function() {
            var nextQns = courseSeq[chapter].qns[question];
            if(nextQns) {
				$location.path('/lesson/' + nextQns.qnsType + '/' + (chapter + 1) + '/' + (question + 1)+ '/' + nextQns.qid);
			} else {
				//Complete current chapter, go to next chapter
				nextQns = courseSeq[chapter+1];
				if(nextQns && courseSeq[chapter+1].qns) {
                    nextQns = courseSeq[chapter+1].qns[0];
					$location.path('/lesson/' + nextQns.qnsType + '/' + (chapter + 2) + '/1/'+ nextQns.qid );
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

    //map the col alphabet to number
    function sheetColMapping(col) {
        mapping = {
            "A" : 1,
            "B" : 2,
            "C" : 3,
            "D" : 4,
            "E" : 5,
            "F" : 6,
            "G" : 7,
            "H" : 8,
            "I" : 9,
            "J" : 10,
            "K" : 11,
            "L" : 12,
            "M" : 13,
            "N" : 14,
            "O" : 15,
            "P" : 16,
            "Q" : 17,
            "R" : 18,
            "S" : 19,
            "T" : 20,
            "U" : 21,
            "V" : 22,
            "W" : 23,
            "X" : 24,
            "Y" : 25,
            "Z" : 26,
        }
        return mapping[col.toUpperCase()]
    }

  };
})();
