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
            //load qns sheet ID
            $scope.sheetID = question.sheetID;
            
            //load admin
            var adminID = $firebaseObject(ref.child('auth/admin/admin'));
            adminID.$loaded().then(function(){
                //load admin spreadsheetId
                var adminUser = $firebaseObject(ref.child('auth/users/' + adminID.$value));
                adminUser.$loaded().then(function(){
                    $scope.eduExcelID = adminUser.driveExcel;
                    
                    //load user spreadsheetId
                    var currentUser = $firebaseObject(ref.child('auth/users/' + user.uid));
                    currentUser.$loaded().then(function(){
                        $scope.userExcelID = currentUser.driveExcel;
                        $scope.userSheetID = currentUser.sheetID; //user current sheetID
                        $scope.token = currentUser.access_token;
                        
                        gapi.auth.setToken({
                            access_token: $scope.token
                        });
                        
                        var discoveryUrl = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
                        gapi.client.load(discoveryUrl).then(loadQns);
        
                        var excelLink = "https://docs.google.com/spreadsheets/d/" + $scope.userExcelID + "/edit";
                        $scope.srclink = $sce.trustAsResourceUrl(excelLink);
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
            
            //Load answer key of the question
            var answerKey = $firebaseObject(ref.child('answerKey/' + qid));
            answerKey.$loaded().then(function(){
                
                //video and slides question type
                if (qnsType == 'video' || qnsType == 'slides'){
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
                    }
                }
                
                //excel question type
                if (qnsType == 'excel') {
                    
                    gapi.auth.setToken({
                        access_token: $scope.token
                    });
                    $scope.range = answerKey.range;
                    $scope.formulaCheck = answerKey.formulaCheck;
                    $scope.valueCheck = answerKey.valueCheck;
                    
                    var discoveryUrl = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
                    gapi.client.load(discoveryUrl).then(function() {
                        checkCellFormula().then(function(result) {
                            if(result.indexOf(false) === -1 && result.indexOf('false') === -1) {
                                checkCellValue().then(function(result){
                                    if (result.indexOf(false) === -1 && result.indexOf('false') === -1) {
                                        nextQns(chapter,qns);
                                    } else {
                                        $scope.incorrect = true;
                                    }
                                });
                            } else {
                                $scope.incorrect = true;
                            }
                        });
                    });
                }
                
                //code question type
                if (qnsType == 'code') {
                    // Check for syntax error
                    var annot = editor.getSession().getAnnotations();
                    if (annot.length == 0) {
                        var input = editor.getValue().replace(/\s+/g, " ");
                        var code = answerKey.testcodeDeclare + input + answerKey.testcode;
                        $scope.testCase = answerKey.testcases;
                        
                        $scope.codeResult = [];
                        var promises = []
                        var totalTestNum = $scope.testCase.length;
                        for (i = 0; i < totalTestNum; i++) { 
                            var test =  $scope.testCase[i];
                            //Run Test case
                            runTestcase(test, code).then(function(result) {
                                $scope.codeResult.push(result);
                                
                                //When end of test case
                                if($scope.codeResult.length === totalTestNum){
                                    if ($scope.codeResult.indexOf(false) === -1) {
                                        nextQns(chapter,qns);
                                    } else {
                                        $scope.incorrect = true;
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
    
    function loadQns() {
        var sheetId1 ;
        gapi.client.sheets.spreadsheets.sheets.copyTo({
          spreadsheetId: $scope.eduExcelID,
          sheetId: $scope.sheetID,
          destinationSpreadsheetId: $scope.userExcelID,
        }).then(function(response) {

          sheetId1 = response.result.sheetId;
          //update user sheetID
          ref.child("/auth/users/" + user.uid).update({ sheetID: sheetId1 });
         
          gapi.client.sheets.spreadsheets.batchUpdate({
              
            spreadsheetId: $scope.userExcelID,
            requests: [
              {
                updateSheetProperties:{
                  properties:{
                    title: $scope.qnsTitle,
                    sheetId: sheetId1
                  },
                  fields: "title"
                }
              }
            ]
          });
        });
    }
   
    function checkCellFormula() {
      var deferred = $q.defer();
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: $scope.userExcelID,
        range: $scope.qnsTitle + "!" + $scope.range,
        valueRenderOption:"FORMULA"
      }).then(function(response) {
          
        $scope.formulaResult = []
        var totalTestNum =  $scope.formulaCheck.length;
        for (i = 0; i < totalTestNum; i++) { 
            var cell = $scope.formulaCheck[i].cell;
            var functionName = $scope.formulaCheck[i].functionName;
            
            var col = sheetColMapping(cell.charAt(0).toUpperCase()) - 1;
            var row = parseInt(cell.substring(1)) - 1;
            
            var formula = String(response.result.values[parseInt(row)][parseInt(col)]);
            
            $scope.formulaResult.push(formula.indexOf(functionName) !== -1);
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
        var totalTestNum =  $scope.valueCheck.length;
        for (i = 0; i < totalTestNum; i++) { 
            var cell = $scope.valueCheck[i].cell;
            var answer = $scope.valueCheck[i].value;
            
            var col = sheetColMapping(cell.charAt(0).toUpperCase()) - 1;
            var row = parseInt(cell.substring(1)) - 1;
            console.log("TESTING");
            console.log(col);
            console.log(row);
            console.log(response.result.values);
            
            
            var valueRow = response.result.values[parseInt(row)];
            if(valueRow) {
                value = valueRow[parseInt(col)];
                $scope.valueResult.push(value === answer);
            } else {
                $scope.valueResult.push(false);
            }
            
        }
        deferred.resolve($scope.valueResult);
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
        };
        return deferred.promise;
    }
    
    function getInlineJSandTest (test, code) {
		var top = 'onmessage = function(msg){';
		var bottom = 'postMessage(result);};';

		var all = test +"\n\n"+top+"\n"+code+"\n"+bottom+"\n"
		var blob = new Blob([all], {"type": "text\/plain"});
		return URL.createObjectURL(blob);
	}

    function nextQns(chapter, question){
        //update course progress in firebase db
        var currentDateTime = new Date().toLocaleString("en-US");
        ref.child('userProfiles').child(user.uid).child('courseProgress').child(qid).set(currentDateTime);    
            
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
				if(nextQns) {
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