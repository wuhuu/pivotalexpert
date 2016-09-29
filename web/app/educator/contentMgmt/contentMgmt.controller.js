(function () {

  angular
    .module('app.contentMgmt')
    .controller('ContentMgmtController', ContentMgmtController)
    .controller('CourseMapController', CourseMapController)
    .directive('onFinishRender', function ($timeout) {
      return {
        restrict: 'A',
        link: function (scope, element, attr) {
          if (scope.$last === true) {
            $timeout(function () {
              $(".accordion1")
                .accordion({
                  header: "> div > #chapterHeader",
                  collapsible: true,
                  heightStyle: "content"
                })
                .sortable({
                  collapsible: true,
                  axis: "y",
                  handle: "#chapterHeader",
                  stop: function (event, ui) {
                    // IE doesn't register the blur when sorting
                    // so trigger focusout handlers to remove .ui-state-focus
                    ui.item.children("#chapterHeader").triggerHandler("focusout");

                    // Refresh accordion to handle new order
                    $(this).accordion("refresh");
                  }
                });

              $(".accordion2").sortable();


            });
          }
          $timeout(function () {
            var cid = scope.$index;
            if (!scope.chapterAdded) {
              $("#text_" + cid).hide();
            }
            $("#text_" + cid).focusout(function () {
              $(this).hide();
            });
          });

        }
      }
    })
    .directive('toggleButton', function ($timeout) {
      return {
        restrict: 'A',
        link: function (scope, element, attr) {
          var id = scope.mcqObj.qnsID;
          $timeout(function () {

            $("#text_" + id).focusout(function () {
              $(this).hide();
            });

            if (!scope.qnsAdded) {
              $("#text_" + id).hide();
            }
            angular.forEach(scope.mcqObj.options, function (value, key) {
              $("#text_" + id + "_" + key).hide();
              $("#text_" + id + "_" + key).focusout(function () {
                $(this).hide();
              });
            });

          });
          if (scope.$last === true) {
            $timeout(function () {
              $("#mcq").sortable();
            });
          }
        }
      }
    })
    .directive('chooseFile', function() {
        return {
          link: function (scope, elem, attrs) {
            var button = elem.find('button');
            var input = angular.element(elem[0].querySelector('input#fileInput'));
            button.bind('click', function() {
              input[0].click();
            });
            input.bind('change', function(e) {
              scope.$apply(function() {
                scope.files = e.target.files;
                if (scope.files[0]) {
                  scope.fileName = scope.files[0].name;
                } else {
                  scope.fileName = null;
                }
              });
            });
          }
        };
      });
    
    
  function ContentMgmtController($http,$scope, $sce, $routeParams, $location,$firebaseArray,$mdDialog, $firebaseObject,commonService, contentMgmtService, $timeout, $q) {
	  console.log("ContentMgmtController");

    var path = $location.$$path;
    path = path.substr(path.indexOf('/educator/'), path.indexOf('_create'));
    var qnsType = path.substr(path.lastIndexOf('/') + 1);
    if (qnsType === 'code') {
      var editor = ace.edit("editor");
    }

    var discoveryUrl = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
    //load user Details
    var ref = firebase.database().ref();
    $timeout(loadUserDetails, 3000);

    if ($routeParams.qid != null) {
      var qid = $routeParams.qid;
      $scope.qid = qid;
      $scope.isNewQuestion = false;
      var question = contentMgmtService.getQuestion(qid);
      question.$loaded().then(function () {
        var answer = contentMgmtService.getAnswerKey(qid)
        answer.$loaded().then(function (answerKey) {
          if (answerKey && question.qnsType === 'mcq') {
            angular.forEach(question.mcq, function (value, key) {
              var ans = answerKey.answer[key];
              value.answer = ans;
            });
          }
          if (question.qnsType === 'code') {
            //Set code box display
            var editor = ace.edit("editor");
            editor.setTheme("ace/theme/chrome");
            editor.getSession().setMode("ace/mode/javascript");
            editor.setOption("maxLines", 30);
            editor.setOption("minLines", 10);
            editor.setValue(question.initialCode);

            //set back the answer
            question.testcases = [];
            angular.forEach(answerKey.testcases, function (value, key) {
              question.testcases.push({ test: value });
            });
          }

          if (question.qnsType === 'excel') {
            $timeout(loadDetails, 3000);
          }
          function loadDetails() {
            question.range = answerKey.range;

            question.valueAnswer = [];
            angular.forEach(answerKey.valueAnswer, function (value, key) {
              question.valueAnswer.push({ cell: value.cell, value: value.value });
            });

            question.formulaAnswer = [];
            angular.forEach(answerKey.formulaAnswer, function (value, key) {
              question.formulaAnswer.push({ cell: value.cell, functionName: value.functionName });
            });

            var excelLink = "https://docs.google.com/spreadsheets/d/" + $scope.userExcelID + "/edit#gid=" + question.sheetID;
            $scope.srclink = $sce.trustAsResourceUrl(excelLink);
          }


          question.qid = question.$id;
          question.cid = $routeParams.cid;
          $scope.qns = question;
        });
      })
        .catch(function (error) {
          console.error("Error:", error);
        });

    } else {
      //"/educator/slides_create/C0"
      $scope.isNewQuestion = true;
      $scope.qns = { qnsTitle: "", qnsType: qnsType, cid: $routeParams.cid }
      if (qnsType === "slides") {
        $scope.qns['slides'] = [];
      } else if (qnsType === "video") {
        $scope.qns['qnsDescription'] = "";
        $scope.qns['qnsInstruction'] = "";
        $scope.qns['link'] = "";
      } else if (qnsType === "mcq") {
        $scope.qns['mcq'] = [];
        $scope.qns['hint'] = "";
        $scope.qns['qnsInstruction'] = [];
      } else if (qnsType === "excel") {
        $scope.qns['hint'] = "";
        $scope.qns['qnsInstruction'] = "";
        $scope.qns['sheetID'] = "";
        //answer key scope
        $scope.qns['range'] = "";
        $scope.qns['formulaAnswer'] = [];
        $scope.qns['valueAnswer'] = [];

        $timeout(delayedTime, 3000);
        function delayedTime() {
          console.log("TESTING 1");
          gapi.client.load(discoveryUrl).then(function () {
            console.log("TESTING 2");
            getAllSheets().then(function (toBeDelete) {
              console.log("TESTING 3");
              deleteSheet(toBeDelete).then(function () {
                console.log("TESTING 4");
                createQuestionSheet();
              });
            });
          });
        }


      } else if (qnsType === "code") {
        $scope.qns['hint'] = "";
        $scope.qns['qnsInstruction'] = "";
        $scope.qns['initialCode'] = "";

        //Set code box display
        editor.setTheme("ace/theme/chrome");
        editor.getSession().setMode("ace/mode/javascript");
        editor.setOption("maxLines", 30);
        editor.setOption("minLines", 10);
      }
    }

    $scope.backToCourseMap = function () {
      window.location.href = "#/educator/courseMap";
    }
    $scope.saveQns = function (ev) {
      var confirm = $mdDialog.confirm()
        .title('Would you want to save all changes?')
        .textContent('This question will be saved to what you configured, is it ok to proceed?')
        .targetEvent(ev)
        .ok('Please do it!')
        .cancel('Cancel!');

      $mdDialog.show(confirm).then(function () {
        if ($scope.qns.qnsType == "video") {
          contentMgmtService.updateVideoQuestion($scope.qns, $scope.isNewQuestion).then(function () {

            window.location.href = "#/educator/courseMap"
            commonService.showSimpleToast("Video Challenge Added/Updated.");
          });
        } else if ($scope.qns.qnsType == "slides") {
          contentMgmtService.updateSlideQuestion($scope.qns, $scope.isNewQuestion).then(function () {

            window.location.href = "#/educator/courseMap";
            commonService.showSimpleToast("Slides Challenge Added/Updated.");
            //$scope.$emit("SuccessPrompt",);
          });
        }
      });

    }

    $scope.deleteSlide = function (index) {
      $scope.qns.slides.splice(index, 1);
    }

    $scope.addSlide = function () {
      $scope.qns.slides.push({ explanation: "", imageLink: "" });
    }

    $scope.toggleQns = function (id) {
      $("#text_" + id).toggle();
    }

    $scope.toggleChoice = function (id, index) {
      $("#text_" + id + "_" + index).toggle();
    }

    $scope.addChoice = function (mcq_id) {
      var length = $scope.qns.mcq[mcq_id].options.length;
      $scope.qns.mcq[mcq_id].options.push("Choice " + (length + 1));

      $("#text_" + mcq_id + "_" + length).hide();
    }

    $scope.saveMCQChanges = function (ev) {
      var qns = $scope.qns;
      var mcqList = qns.mcq;
      if (qns)

        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = $mdDialog.confirm()
          .title('Would you want to save all changes?')
          .textContent('This question will be saved to what you configured, is it ok to proceed?')
          .targetEvent(ev)
          .ok('Please do it!')
          .cancel('Cancel!');

      $mdDialog.show(confirm).then(function () {
        var listToUpdate = [];
        var qids = $("#mcq").find('strong');
        // updating the question sequence
        for (i = 0; i < qids.length; i++) {
          var qid = qids[i].innerText.replace('.', '');
          $.each(mcqList, function (index, value) {
            if (value.qnsID === qid) {
              listToUpdate.push(mcqList[index]);
              return false;
            }
          });
        }
        $scope.qns.mcq = listToUpdate;

        contentMgmtService.updateMCQ($scope.qns, $scope.isNewQuestion).then(function () {
          window.location.href = "#/educator/courseMap"
          commonService.showSimpleToast("MCQ Challenge Added/Updated.");
        });
      }, function () {
        // cancel function
      });

    };

    $scope.deleteChoice = function (mcq_id, index) {
      $scope.qns.mcq[mcq_id].options.splice(index, 1);
    }

    $scope.deleteMcq = function (index) {
      $scope.qns.mcq.splice(index, 1);
    }

    $scope.addMcq = function () {
      if ($scope.qns.mcq) {
        var qnsID = "Q" + ($scope.qns.mcq.length + 1);
      } else {
        $scope.qns.mcq = [];
        var qnsID = "Q1";
      }

      $scope.qns.mcq.push({ options: [], qns: "", qnsID: qnsID });
      $scope.qnsAdded = true;
    }

    $scope.deleteQns = function (ev, cid, qid) {
      var confirm = $mdDialog.confirm()
        .title('Do you really want to DELETE this question?')
        .textContent('This question will deleted, is it ok to proceed?')
        .targetEvent(ev)
        .ok('Delete it now!')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function () {
        contentMgmtService.deleteQuestion(cid, qid).then(function () {
          window.location.href = "#/educator/courseMap"
          //window.location.reload();
        });
      }, function () {
        // cancel function
      });
    }

    $scope.deleteChap = function (ev, cid) {
      var confirm = $mdDialog.confirm()
        .title('Do you really want to DELETE this question?')
        .textContent('This question will deleted, is it ok to proceed?')
        .targetEvent(ev)
        .ok('Delete it now!')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function () {
        contentMgmtService.deleteChapter(cid).then(function () {
          window.location.href = "#/educator/courseMap"
        });
      }, function () {
        // cancel function
      });
    }

    // ADDITION PART for code and excel
    // Code box
    //Add more test cases
    $scope.addTestcase = function () {
      if ($scope.qns.testcases) {
      } else {
        $scope.qns.testcases = [];
      }
      $scope.qns.testcases.push({ test: "" });
    }
    //Create && Update Code box
    $scope.saveCodeBoxChanges = function (ev) {
      console.log(editor);
      // Appending dialog to document.body to cover sidenav in docs app
      var confirm = $mdDialog.confirm()
        .title('Would you want to save all changes?')
        .textContent('This question will be saved to what you configured, is it ok to proceed?')
        .targetEvent(ev)
        .ok('Please do it!')
        .cancel('Cancel!');

      $mdDialog.show(confirm).then(function () {
        var editor = ace.edit("editor")
        $scope.qns.initialCode = editor.getValue();

        contentMgmtService.updateCodebox($scope.qns, $scope.isNewQuestion).then(function (result) {
          window.location.href = "#/educator/courseMap"
          commonService.showSimpleToast("Code Challenge Added/Updated.");
        });
      }, function () {
        // cancel function
      });

    };

    function loadUserDetails() {
      var user = firebase.auth().currentUser;
      var currentUser = $firebaseObject(ref.child('auth/users/' + user.uid));
      currentUser.$loaded().then(function () {
        $scope.userExcelID = currentUser.eduSheet;
        $scope.userToken = currentUser.access_token;
        gapi.auth.setToken({
          access_token: $scope.userToken
        });
      });
    }

    //Add more value answer
    $scope.addValueAnswer = function () {
      $scope.qns.valueAnswer.push({ cell: "", value: "" });
    }

    $scope.deleteValueAns = function (index) {
      $scope.qns.valueAnswer.splice(index, 1);
    }

    //Add more formula answer
    $scope.addFormulaAnswer = function () {
      $scope.qns.formulaAnswer.push({ cell: "", functionName: "" });
    }

    $scope.deleteFormulaAns = function (index) {
      $scope.qns.formulaAnswer.splice(index, 1);
    }

    //Create && Update
    $scope.saveExcelChanges = function (ev) {
      // Appending dialog to document.body to cover sidenav in docs app
      var confirm = $mdDialog.confirm()
        .title('Would you want to save all changes?')
        .textContent('This question will be saved to what you configured, is it ok to proceed?')
        .targetEvent(ev)
        .ok('Please do it!')
        .cancel('Cancel!');

      $mdDialog.show(confirm).then(function () {

        contentMgmtService.updateExcel($scope.qns, $scope.isNewQuestion).then(function (result) {
          gapi.client.load(discoveryUrl).then(updateSheetTitle);
          commonService.showSimpleToast("Excel Challenge Added/Updated.");
        });
      }, function () {
        // cancel function
      });
    };

    function getAllSheets() {
      var deferred = $q.defer();
      gapi.client.sheets.spreadsheets.get({
        spreadsheetId: $scope.userExcelID
      }).then(function (response) {
        var sheets = response.result.sheets;
        var sheetID = null;
        for (i = 0; i < sheets.length; i++) {
          var sheetTitle = sheets[i].properties.title;
          if (sheetTitle === "New Question Created") {
            sheetID = sheets[i].properties.sheetId;
            deferred.resolve(sheetID);
          }
        }
        if (sheetID == null) {
          deferred.resolve(true);
        }


      });
      return deferred.promise;
    }

    function deleteSheet(sheetId1) {
      var deferred = $q.defer();
      if (sheetId1 == true) {
        deferred.resolve(true);
      }
      gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: $scope.userExcelID,
        requests: [
          {
            deleteSheet: {
              sheetId: sheetId1
            }
          }
        ]
      }).then(function (response) {
        deferred.resolve(true);

      });
      return deferred.promise;
    }

    function createQuestionSheet() {
      gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: $scope.userExcelID,
        requests: [
          {
            addSheet: {
              properties: {
                title: "New Question Created",
              }
            }
          }
        ]
      }).then(function (response) {
        $scope.qns.sheetID = (response.result.replies[0].addSheet.properties.sheetId);
        var excelLink = "https://docs.google.com/spreadsheets/d/" + $scope.userExcelID + "/edit#gid=" + $scope.qns.sheetID;
        $scope.srclink = $sce.trustAsResourceUrl(excelLink);
      });
    }

    function updateSheetTitle() {
      gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: $scope.userExcelID,
        requests: [
          {
            updateSheetProperties: {
              properties: {
                title: $scope.qns.qnsTitle,
                sheetId: $scope.qns.sheetID
              },
              fields: "title"
            }
          }
        ]
      }).then(function (response) {
        window.location.href = "#/educator/courseMap"
      });
    }

  }

  function CourseMapController($timeout, $http, $scope, $routeParams, $mdDialog, $location, $firebaseObject, contentMgmtService) {
    $scope.chapTBD = [];
    $scope.qnsTBD = [];
    $scope.chapters = [];
    $scope.qnsTypes = ["Video", "Slides", "MCQ", "Excel", "Code"];
    var courseMap = contentMgmtService.getCourseSeq();
    courseMap.$loaded().then(function () {
      var seq = [];
      for (i = 0; i < courseMap.length; i++) {
        seq.push(courseMap[i]);
        $scope.chapters.push({ cid: courseMap[i].cid, chapterTitle: courseMap[i].chapterTitle });
      }

      $scope.courseMap = seq;
    });

    $scope.openMenu = function ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

    $scope.exportCourse = function () {
      //from string to object = angular.fromJson(json);
      contentMgmtService.getCourseJson().then(function (dbjson) {
        dbjson.$loaded().then(function () {
          delete dbjson.$$conf;
          delete dbjson.$id;
          delete dbjson.$priority;
          delete dbjson.auth;
          delete dbjson.courseSetting;
          delete dbjson.signinLogs;
          delete dbjson.userProfiles;

          var json = JSON.stringify(dbjson);

          var url = URL.createObjectURL(new Blob([json]));
          var a = document.createElement('a');
          a.href = url;
          a.download = 'course_json.json';
          a.target = '_blank';
          a.click();

          $mdDialog.hide();
        });
      });
    }

    $scope.showExportPrompt = function (ev) {
      // Appending dialog to document.body to cover sidenav in docs app
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: ev,
        template:

        '<md-dialog style="padding:20px">' +
        '<form name="qnsForm">' +
        ' <h3>Export options:</h3><br>' +
        '  <md-dialog-content>' +
        '  <md-input-container style="width:500px;height:auto;">' +
        '    <label>Please select Chapter to put question in.</label> ' +
        '    <md-select ng-model="selectedChapter" name="chapter" required>' +
        '      <md-option ng-repeat="item in chapters" value="{{item.cid}}">' +
        '       {{item.chapterTitle}}' +
        '      ' +
        '    </md-option></md-select>' +
        '    <ng-messages for="qnsForm.chapter.$error" md-auto-hide="true">' +
        '      <div ng-message="required">This is required.</div>' +
        '    </ng-messages>' +
        '  </md-input-container><br>' +
        '  </md-dialog-content>' +
        '  <md-dialog-actions>' +
        '    <md-button ng-click="closeDialog()" class="md-primary">' +
        '      Close' +
        '    </md-button>' +
        '    <md-button type="submit" ng-click="qnsForm.$valid && nextStep()" class="md-primary">' +
        '      Proceed' +
        '    </md-button>' +
        '  </md-dialog-actions>' +
        '</form>' +
        '</md-dialog>',
        locals: {
          chapters: $scope.chapters
        },
        controller: DialogController
      });

      function DialogController($scope, $mdDialog, chapters) {
        $scope.chapters = chapters;
        $scope.selectedChapter = '';
        $scope.closeDialog = function () {
          $mdDialog.hide();
        }

        $scope.nextStep = function () {
          var ref = firebase.database().ref();
          var exportObj = {};
          var course = {};
          var courseSeq = contentMgmtService.getCourseSeq();
          courseSeq.$loaded().then(function (courseSeq) {
            angular.forEach(courseSeq, function (courseSeqValue, key) {

              if (courseSeqValue.cid === $scope.selectedChapter) {
                var answerKeyNodeRef = ref.child('answerKey');
                answerKeyNodeRef.once("value", function (answerSnapshot) {
                  var questionNodeRef = ref.child('course/questions');
                  questionNodeRef.once("value", function (snapshot) {
                    // loop through questions
                    var questions = {};
                    var answerKey = {};
                    angular.forEach(courseSeqValue.qns, function (qnsValue, key) {
                      if (snapshot.child(qnsValue.qid).exists()) {
                        var qns = snapshot.child(qnsValue.qid).val();
                        questions[qnsValue.qid] = qns;
                      }

                      if (answerSnapshot.child(qnsValue.qid).exists()) {
                        var ans = answerSnapshot.child(qnsValue.qid).val();
                        answerKey[qnsValue.qid] = ans;
                      }
                    });

                    exportObj["answerKey"] = answerKey;
                    exportObj["course"] = { questions: questions }
                    delete courseSeqValue.$id;
                    delete courseSeqValue.$priority;
                    exportObj["courseSequence"] = courseSeqValue;

                    
                  });
                }).then(function(){
                  contentMgmtService.getChapter(courseSeqValue.cid).then(function (chapter) {
                      chapter.$loaded().then(function () {
                        delete chapter.$$conf;
                        delete chapter.$id;
                        delete chapter.$priority;

                        exportObj["course"]["chapters"] = { chap: chapter };

                        var jsonString = JSON.stringify(exportObj);
                        var url = URL.createObjectURL(new Blob([jsonString]));
                        var a = document.createElement('a');
                        a.href = url;
                        a.download = 'chapter_json.json';
                        a.target = '_blank';
                        a.click();

                        $mdDialog.hide();
                      });
                    });
                });
                return false;
              }
            });
          });
        }
      }
    };

    $scope.showImportPrompt = function(ev) {
    // Appending dialog to document.body to cover sidenav in docs app
      var parentEl = angular.element(document.body);
       $mdDialog.show({
         parent: parentEl,
         targetEvent: ev,
         template:

           '<form name="qnsForm">'+
           '<md-dialog style="padding:20px; width:500px">' +
           ' <h3>Import options:</h3><br>'+
           '  <md-dialog-content>'+
           '    </br> ' +
           '    <label>Select the chapter content to import</label> </br>'+
           '   <choose-file layout="row"> '+
           '     <input id="fileInput" type="file" class="ng-hide"> '+
           '     <md-input-container flex class="md-block" > '+
           '       <input type="text" ng-model="fileName"> '+
           '     </md-input-container> '+
           '     <div> '+
           '       <md-button id="uploadButton" class="md-fab md-mini"> '+
           '         <md-icon class="material-icons">attach_file</md-icon> '+
           '       </md-button> '+
           '     </div> '+
           '   </choose-file> '+
           '    <label style="color: red">{{fileError}}</label>'+
           '  </md-dialog-content>' +
           '  <md-dialog-actions>' +
           '    <md-button ng-click="closeDialog()" class="md-primary">' +
           '      Close' +
           '    </md-button>' +
           '    <md-button type="submit" ng-click="qnsForm.$valid && nextStep()" class="md-primary">' +
           '      Proceed' +
           '    </md-button>' +
           '  </md-dialog-actions>' +
           '</form>'+
           '</md-dialog>',
         locals: {
           chapters: $scope.chapters
         },
         controller: DialogController
      });

      function DialogController($scope, $mdDialog,chapters) {
        $scope.chapters = chapters;
        $scope.selectedChapter = '';
        $scope.closeDialog = function() {
          $mdDialog.hide();
        }

        $scope.nextStep = function() {
          $scope.fileError = "";
          if($scope.files) {
            var file = $scope.files[0];
            var reader = new FileReader();
            var ref = firebase.database().ref();
            var sequenceRef = ref.child('/courseSequence/');
            var questionRef = ref.child('/course/questions');
            var chapterRef = ref.child('/course/chapters');
                
            // Closure to capture the file information.
            reader.onload = (function(theFile) {
              return function(e) {
                try {
                    JsonObj = JSON.parse(e.target.result);
  
                    var answer = JsonObj.answerKey;
                    var sequence = JsonObj.courseSequence;
                    var question = JsonObj.course.questions;
                    var chapter = JsonObj.course.chapters;
                    
                    var cid = "";
                    var qnsList = [];
                    
                    angular.forEach(chapter, function(chap, key) {
                        var chapRef = chapterRef.push(chap);
                        cid = chapRef.key;
                        ref.child('/course/chapters/' + cid).update({helpRoomCode : cid});
                    });
                    angular.forEach(question, function(qns, key) {
                        var qnsRef = questionRef.push(qns);
                        var qid = qnsRef.key;
                        if (answer[key]) {
                            ref.child('/answerKey/' + qid).set(answer[key]);
                        }
                    qnsList.push({qid : qid, qnsTitle : qns.qnsTitle, qnsType : qns.qnsType});
                    });
                    
                    sequence.cid = cid;
                    sequence.qns = qnsList;

                    sequenceRef.once("value", function (snapshot) {
                        sequenceRef.child(snapshot.numChildren()).set(sequence);
                        window.location.reload();
                    });
                    
                }catch(err) {
                    $scope.fileError = "Please upload file in correct JSON format.";
                }
              };
            })(file);

              // Read in the image file as a data URL.
            reader.readAsText(file);
          } else {
              $scope.fileError = "Failed to load file";
          }
        }

      }
    };

    $scope.importCourse = function(ev) {
    // Appending dialog to document.body to cover sidenav in docs app
      var parentEl = angular.element(document.body);
       $mdDialog.show({
         parent: parentEl,
         targetEvent: ev,
         template:

           '<form name="qnsForm">'+
           '<md-dialog style="padding:20px; width:500px">' +
           ' <h3>Import options:</h3><br>'+
           '  <md-dialog-content>'+
           '    </br> ' +
           '    <label>Select the course content to import</label> </br>'+
           '   <choose-file layout="row"> '+
           '     <input id="fileInput" type="file" class="ng-hide"> '+
           '     <md-input-container flex class="md-block" > '+
           '       <input type="text" ng-model="fileName"> '+
           '     </md-input-container> '+
           '     <div> '+
           '       <md-button id="uploadButton" class="md-fab md-mini"> '+
           '         <md-icon class="material-icons">attach_file</md-icon> '+
           '       </md-button> '+
           '     </div> '+
           '   </choose-file> '+
           '    <label style="color: red">{{fileError}}</label>'+
           '  </md-dialog-content>' +
           '  <md-dialog-actions>' +
           '    <md-button ng-click="closeDialog()" class="md-primary">' +
           '      Close' +
           '    </md-button>' +
           '    <md-button type="submit" ng-click="qnsForm.$valid && nextStep()" class="md-primary">' +
           '      Proceed' +
           '    </md-button>' +
           '  </md-dialog-actions>' +
           '</form>'+
           '</md-dialog>',
         locals: {
           chapters: $scope.chapters
         },
         controller: DialogController
      });

      function DialogController($scope, $mdDialog,chapters) {
        $scope.chapters = chapters;
        $scope.selectedChapter = '';
        $scope.closeDialog = function() {
          $mdDialog.hide();
        }

        $scope.nextStep = function() {
          $scope.fileError = "";
          if($scope.files) {
            var file = $scope.files[0];
            var reader = new FileReader();
            var ref = firebase.database().ref();
            var sequenceRef = ref.child('/courseSequence/');
            var questionRef = ref.child('/course/questions');
            var chapterRef = ref.child('/course/chapters');
                
            // Closure to capture the file information.
            reader.onload = (function(theFile) {
              return function(e) {
               // try {
                    JsonObj = JSON.parse(e.target.result);

                    var answer = JsonObj.answerKey;
                    var sequences = JsonObj.courseSequence;
                    var question = JsonObj.course.questions;
                    var chapter = JsonObj.course.chapters;

                    angular.forEach(sequences, function(sequence, key) {
                        
                        var cid = "";
                        var qnsList = [];
                        angular.forEach(chapter, function(chap, key) {
                            if(key == sequence.cid) {
                                var chapRef = chapterRef.push(chap);
                                cid = chapRef.key;
                                ref.child('/course/chapters/' + cid).update({helpRoomCode : cid});
                            }
                        });
                        
                        
                        angular.forEach(sequence.qns, function(seqQns, seqKey) {
                            angular.forEach(question, function(qns, qnsKey) {
                                if (seqQns.qid == qnsKey) {
                                    var qnsRef = questionRef.push(qns);
                                    var qid = qnsRef.key;
                                    if (answer[qnsKey]) {
                                        ref.child('/answerKey/' + qid).set(answer[qnsKey]);
                                    }
                                    qnsList.push({qid : qid, qnsTitle : qns.qnsTitle, qnsType : qns.qnsType});
                                }
                            });
                        });
                        sequence.cid = cid;
                        sequence.qns = qnsList;


                        sequenceRef.once("value", function (snapshot) {
                            sequenceRef.child(snapshot.numChildren()).set(sequence);
                            window.location.reload();
                        });
                    
                    });
                    /*
                }catch(err) {
                    $scope.fileError = "Please upload file in correct JSON format.";
                }
                */
              };
            })(file);

              // Read in the image file as a data URL.
            reader.readAsText(file);
          } else {
              $scope.fileError = "Failed to load file";
          }
        }

      }
    };


    $scope.showPrompt = function(ev) {
    // Appending dialog to document.body to cover sidenav in docs app
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: ev,
        template:

        '<md-dialog style="padding:20px">' +
        '<form name="qnsForm">' +
        ' <h3>Options to create question:</h3><br>' +
        '  <md-dialog-content>' +
        '  <md-input-container style="width:500px;height:auto;">' +
        '    <label>Please select Chapter to put question in.</label> ' +
        '    <md-select ng-model="selectedChapter" name="chapter" required>' +
        '      <md-option ng-repeat="item in chapters" value="{{item.cid}}">' +
        '       {{item.chapterTitle}}' +
        '      ' +
        '    </md-option></md-select>' +
        '    <ng-messages for="qnsForm.chapter.$error" md-auto-hide="true">' +
        '      <div ng-message="required">This is required.</div>' +
        '    </ng-messages>' +
        '  </md-input-container><br>' +
        '  <md-input-container style="width:500px;height:auto;">' +
        '    <label>Select question Type.</label> ' +
        '    <md-select ng-model="selectedQnsType" name="type" required>' +
        '      <md-option ng-repeat="item in qnsTypes" value="{{item}}">' +
        '       {{item}}' +
        '      ' +
        '    </md-option></md-select>' +
        '    <ng-messages for="qnsForm.type.$error" md-auto-hide="true">' +
        '      <div ng-message="required">This is required.</div>' +
        '    </ng-messages>' +
        '  </md-input-container>' +
        '  </md-dialog-content>' +
        '  <md-dialog-actions>' +
        '    <md-button ng-click="closeDialog()" class="md-primary">' +
        '      Close' +
        '    </md-button>' +
        '    <md-button type="submit" ng-click="qnsForm.$valid && nextStep()" class="md-primary">' +
        '      Proceed' +
        '    </md-button>' +
        '  </md-dialog-actions>' +
        '</form>' +
        '</md-dialog>',
        locals: {
          chapters: $scope.chapters,
          qnsTypes: $scope.qnsTypes
        },
        controller: DialogController
      });

      function DialogController($scope, $mdDialog, chapters, qnsTypes) {
        $scope.chapters = chapters;
        $scope.selectedChapter = '';
        $scope.selectedQnsType = '';
        $scope.qnsTypes = qnsTypes;
        $scope.closeDialog = function () {
          $mdDialog.hide();
        }
        $scope.nextStep = function () {
          $scope.selectedQnsType = $scope.selectedQnsType.toLowerCase();

          $location.path('educator/' + $scope.selectedQnsType + '_create/' + $scope.selectedChapter);
          $mdDialog.hide();
        }
      }
    };

    $scope.editQuestion = function (qid, cid) {
      var question = contentMgmtService.getQuestion(qid);
      question.$loaded().then(function () {
        $location.path('educator/' + question.qnsType + '_edit/' + cid + '/' + qid);
      })
        .catch(function (error) {
          console.error("Error:", error);
        });
    }

    $scope.addChapter = function () {
      $scope.courseMap.push({ chapterTitle: "", });
      $("#text_" + ($scope.courseMap.length - 1)).show();
      $scope.chapterAdded = true;
      //window.scrollTo(0,document.body.scrollHeight);
      $('html, body').animate({ scrollTop: $(document).height() }, 'slow');
    }

    $scope.saveAllChanges = function (ev) {

      var confirm = $mdDialog.confirm()
        .title('Would you want to save all changes?')
        .textContent('System will be saved to what you configured, is it ok to proceed?')
        .targetEvent(ev)
        .ok('Please do it!')
        .cancel('Cancel!');

      $mdDialog.show(confirm).then(function () {
        saveCourseSequence();
        //$location.path('/educator/courseMap');
      });
    }
    
    function saveCourseSequence() {
        var courseSequence = [];
        var chap = {};
        var qlist = [];
        var qns = {};
        $("div#chapter").each(function (index, value) {
          var c = $(this).find('h2.cid');
          console.log(index + ":" + $(this).attr('id'));
          var cid = c.attr('cid');
          var title = c.text().trim();
          chap['cid'] = cid;
          chap['chapterTitle'] = title;
          var qElements = $(this).find('h4.question');

          // all question here
          for (i = 0; i < qElements.length; i++) {
            var obj = qElements[i];
            //console.log("questionid: "+ obj.id);
            qns['qid'] = obj.id;
            qns['qnsTitle'] = obj.textContent;
            qns['qnsType'] = obj.getAttribute("qnsType");
            qlist.push(qns);
            qns = {};
          }

          chap['qns'] = qlist;
          courseSequence.push(chap);
          chap = {};
          qlist = [];

        });

        contentMgmtService.deleteQuestionFromCM($scope.qnsTBD);
        contentMgmtService.deleteChapter($scope.chapTBD).then(function () {
          contentMgmtService.updateEntireSeq(courseSequence).then(function () {
            window.location.reload();
          });
        });
    }
    
    $scope.deleteChapter = function (index, cid) {
      $scope.courseMap.splice(index, 1);
      $scope.chapTBD.push(cid);
    }

    $scope.deleteQuestion = function (chapterIndex, index, qid) {
      $scope.courseMap[chapterIndex].qns.splice(index, 1);
      $scope.qnsTBD.push(qid);
    }

    $scope.toggleChapterTextbox = function (id) {
      $("#text_" + id).toggle();
    }

  }



})();
