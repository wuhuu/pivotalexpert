(function () {

  angular
    .module('app.contentMgmt')
    .controller('ContentMgmtController', ContentMgmtController)
    .controller('CourseMapController', CourseMapController)
    .controller('BookController', BookController)
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
    .directive('chooseFile', function () {
      return {
        link: function (scope, elem, attrs) {
          var button = elem.find('button');
          var input = angular.element(elem[0].querySelector('input#fileInput'));
          button.bind('click', function () {
            input[0].click();
          });
          input.bind('change', function (e) {
            scope.$apply(function () {
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
    }).directive('onBookFinishRender', function ($timeout) {
      return {
        restrict: 'A',
        link: function (scope, element, attr) {
          if (scope.$last === true) {
            $timeout(function () {
              $("#accordion1").sortable({handle: "#bid"});
            });
          }
        }
      }
    });


  function ContentMgmtController($http, $scope, $rootScope, $sce, $routeParams, $location, $firebaseArray, $mdDialog, $firebaseObject, commonService, contentMgmtService, $timeout, $q) {


    console.log("ContentMgmtController");

    contentMgmtService.saveBookID($routeParams.bid);
    var path = $location.$$path;
    path = path.substr(path.indexOf('/educator/'), path.indexOf('_create'));
    var qnsType = path.substr(path.lastIndexOf('/') + 1);
    if (qnsType == 'google_form') {
      qnsType = 'form';
    } else if (qnsType === 'code') {
      var functionEditor = ace.edit("functionEditor");
      var qnsEditor = ace.edit("qnsEditor");
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
            var functionEditor = ace.edit("functionEditor");
            functionEditor.setTheme("ace/theme/chrome");
            functionEditor.getSession().setMode("ace/mode/javascript");
            functionEditor.setOption("maxLines", 30);
            functionEditor.setOption("minLines", 10);
            functionEditor.setValue(answer.functionCode);
            var qnsEditor = ace.edit("qnsEditor");
            qnsEditor.setTheme("ace/theme/chrome");
            qnsEditor.getSession().setMode("ace/mode/javascript");
            qnsEditor.setOption("maxLines", 30);
            qnsEditor.setOption("minLines", 10);
            qnsEditor.setValue(question.initialCode);

            //set back the answer
            question.testcases = [];
            angular.forEach(answerKey.testcases, function (value, key) {
              question.testcases.push(value);
            });
          }

          if (question.qnsType === 'excel') {
            $timeout(loadDetails, 3000);
          }
          function loadDetails() {
            question.testcases = [];
            angular.forEach(answerKey.testcases, function (value, key) {
              question.testcases.push({ cellToChange: value.cellToChange, changedTo: value.changedTo, expectCell: value.expectCell, toEqual: value.toEqual, msg: value.msg });
            });

            var excelLink = "https://docs.google.com/spreadsheets/d/" + $scope.userExcelID + "/edit#gid=" + question.sheetID;
            $scope.srclink = $sce.trustAsResourceUrl(excelLink);
          }

          question.qid = question.$id;
          question.cid = $routeParams.cid;

          //adding youtube url before it youtube id
          if(question.qnsType === 'video') {
            question.link = "http://www.youtube.com/watch?v=" + question.link;
          }

          if(question.qnsType === 'iframe') {
            if(!question.qnsInstruction) {
                question.qnsInstruction = "";
            }
            if(!question.qnsDescription) {
                question.qnsDescription = "";
            }
          }


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
      } else if (qnsType === "video" || qnsType == "iframe") {
        $scope.qns['qnsDescription'] = "";
        $scope.qns['qnsInstruction'] = "";
        $scope.qns['link'] = "";
      } else if (qnsType === "mcq") {
        $scope.qns['mcq'] = [];
        $scope.qns['hint'] = "";
        $scope.qns['qnsInstruction'] = [];
      } else if (qnsType === "form") {
        $scope.qns['link'] = "";
      } else if (qnsType === "excel") {
        $scope.qns['qnsInstruction'] = "";
        $scope.qns['sheetID'] = "";
        //answer key scope
        $scope.qns['testcases'] = [];

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
        $scope.qns['qnsInstruction'] = "";

        //Set code box display
        functionEditor.setTheme("ace/theme/chrome");
        functionEditor.getSession().setMode("ace/mode/javascript");
        functionEditor.setOption("maxLines", 30);
        functionEditor.setOption("minLines", 10);

        qnsEditor.setTheme("ace/theme/chrome");
        qnsEditor.getSession().setMode("ace/mode/javascript");
        qnsEditor.setOption("maxLines", 30);
        functionEditor.setOption("minLines", 10);
      }
    }

    $scope.backToCourseMap = function () {
      window.location.href = "#/educator/bookMap/" + contentMgmtService.getBookID();
    }

    $scope.saveQns = function (ev) {
      var confirm = $mdDialog.confirm()
        .title('Would you want to save all changes?')
        .textContent('This challenge will be saved to what you configured, is it ok to proceed?')
        .targetEvent(ev)
        .ok('Please do it!')
        .cancel('Cancel!');

      $mdDialog.show(confirm).then(function () {
        if ($scope.qns.qnsType == "video") {
          contentMgmtService.updateVideoQuestion($scope.qns, $scope.isNewQuestion).then(function () {

            window.location.href = "#/educator/bookMap/" + contentMgmtService.getBookID();
            commonService.showSimpleToast("Video Challenge Added/Updated.");
          });
        } else if ($scope.qns.qnsType == "iframe") {
          contentMgmtService.updateIFrameQuestion($scope.qns, $scope.isNewQuestion).then(function () {

            window.location.href = "#/educator/bookMap/" + contentMgmtService.getBookID();
            commonService.showSimpleToast("IFrame Challenge Added/Updated.");
          });
        } else if ($scope.qns.qnsType == "slides") {
          if ($scope.qns.slides.length != 0) {
            contentMgmtService.updateSlideQuestion($scope.qns, $scope.isNewQuestion).then(function () {

              window.location.href = "#/educator/bookMap/" + contentMgmtService.getBookID();;
              commonService.showSimpleToast("Slides Challenge Added/Updated.");
              //$scope.$emit("SuccessPrompt",);
            });
          }else {
            commonService.showSimpleToast("There must at least have one slide.");
          }
        } else if ($scope.qns.qnsType == "form") {
          contentMgmtService.updateFormQuestion($scope.qns, $scope.isNewQuestion).then(function (result) {
            if (result) {
              window.location.href = "#/educator/bookMap/" + contentMgmtService.getBookID();;
              commonService.showSimpleToast("Google Form Challenge Added/Updated.");
            } else {
              commonService.showSimpleToast(" Added/Updated Failed! This Challenge Title had been used.");
            }
          });
        }
      });

    }

    $scope.deleteSlide = function (index) {
      $scope.qns.slides.splice(index, 1);
    }

    $scope.addSlide = function () {
      if($scope.qns.slides!=null) {
        $scope.qns.slides.push({ explanation: "", imageLink: "" });
      }else {
        $scope.qns[slides] = [{explanation: "", imageLink: "" }];
      }
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
          window.location.href = "#/educator/bookMap/" + contentMgmtService.getBookID();
          commonService.showSimpleToast("MCQ Challenge Added/Updated.");
        });
      }, function () {
        // cancel function
      });

    };

    $scope.deleteChoice = function (mcq_id, index) {
      
      if($scope.qns.mcq[mcq_id].answer === $scope.qns.mcq[mcq_id].options[index]) {
        $scope.qns.mcq[mcq_id].answer ="";
      }
      
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

      $scope.qns.mcq.push({ options: ['Choice 1', 'Choice 2'], qns: "", qnsID: qnsID, answer:'Choice 1' });
      $scope.qnsAdded = true;
    }

    $scope.deleteQns = function (ev, cid, qid) {
      var confirm = $mdDialog.confirm()
        .title('Do you really want to DELETE this challenge?')
        .textContent('This challenge will deleted, is it ok to proceed?')
        .targetEvent(ev)
        .ok('Delete it now!')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function () {
        contentMgmtService.deleteQuestion(cid, qid).then(function () {
          window.location.href = "#/educator/bookMap/" + contentMgmtService.getBookID();
          commonService.showSimpleToast("Question deleted.");
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
          window.location.href = "#/educator/bookMap/" + contentMgmtService.getBookID();
        });
      }, function () {
        // cancel function
      });
    }

    // ADDITION PART for code
    // Code box

    //deleteTestCase
    $scope.deleteCodeTestCase = function (index) {
      $scope.qns.testcases.splice(index, 1);
    }

    //Add more test cases
    $scope.addTestcase = function () {
      if ($scope.qns.testcases) {
      } else {
        $scope.qns.testcases = [];
      }
      $scope.qns.testcases.push({ name: "", expect: "", toEqual: "", hint: "" });
    }
    //Create && Update Code box
    $scope.saveCodeBoxChanges = function (ev) {
      console.log(qnsEditor);
      // Appending dialog to document.body to cover sidenav in docs app
      var confirm = $mdDialog.confirm()
        .title('Would you want to save all changes?')
        .textContent('This challenge will be saved to what you configured, is it ok to proceed?')
        .targetEvent(ev)
        .ok('Please do it!')
        .cancel('Cancel!');

      $mdDialog.show(confirm).then(function () {
        var qnsEditor = ace.edit("qnsEditor")
        var functionEditor = ace.edit("functionEditor")
        $scope.qns.initialCode = qnsEditor.getValue();
        $scope.qns.functionCode = functionEditor.getValue();
        if($scope.qns.testcases.length!=0) {
          contentMgmtService.updateCodebox($scope.qns, $scope.isNewQuestion).then(function (result) {
            window.location.href = "#/educator/bookMap/" + contentMgmtService.getBookID();
            commonService.showSimpleToast("Code Challenge Added/Updated.");
          });
        }else {
          commonService.showSimpleToast("Please add at least 1 test case.");
        }
      }, function () {
        // cancel function
      });

    };

    function loadUserDetails() {
      var user = firebase.auth().currentUser;
      var adminRef = ref.child('auth/admin');
      var currentUser = $firebaseObject(ref.child('auth/users/' + user.uid));
      currentUser.$loaded().then(function () {
        //load educator spreadsheets
        adminRef.once('value', function (snapshot) {
          $scope.userExcelID = snapshot.child('spreadsheetID').val()
        });
        $scope.userToken = currentUser.access_token;
        gapi.auth.setToken({
          access_token: $scope.userToken
        });
      });
    }

    // ADDITION PART for excel
    //Add more value answer
    $scope.addValidation = function () {
      $scope.qns.testcases.push({ cellToChange: "", changedTo: "", expectCell: "", toEqual: "", msg: "" });
    }

    $scope.deleteValidation = function (index) {
      $scope.qns.testcases.splice(index, 1);
    }

    //Create && Update
    $scope.saveExcelChanges = function (ev) {
      // Appending dialog to document.body to cover sidenav in docs app
      var confirm = $mdDialog.confirm()
        .title('Would you want to save all changes?')
        .textContent('This challenge will be saved to what you configured, is it ok to proceed?')
        .targetEvent(ev)
        .ok('Please do it!')
        .cancel('Cancel!');

      $mdDialog.show(confirm).then(function () {

        contentMgmtService.updateExcel($scope.qns, $scope.isNewQuestion).then(function (result) {
          if (result) {
            gapi.client.load(discoveryUrl).then(updateSheetTitle);
            commonService.showSimpleToast("Excel Challenge Added/Updated.");
          } else {
            commonService.showSimpleToast(" Added/Updated Failed! This Challenge Title had been used.");
          }
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
        window.location.href = "#/educator/bookMap/" + contentMgmtService.getBookID();
      });
    }

  }

  function CourseMapController($timeout, $http, $rootScope, $scope, $routeParams, $mdDialog, $location, $firebaseObject, contentMgmtService, $q) {

    $scope.chapTBD = [];
    $scope.qnsTBD = [];
    $scope.chapters = [];
    $scope.qnsTypes = ["Video", "Slides", "MCQ", "Excel", "Code", "Google_Form", "IFrame"];

    $scope.bid = $routeParams.bid;
    contentMgmtService.saveBookID($routeParams.bid);
    $scope.book = contentMgmtService.getBook($routeParams.bid);

    var courseMap = contentMgmtService.getCourseSeq($routeParams.bid);

    var ref = firebase.database().ref();

    //Load Google Auth
    var adminIDRef = ref.child('auth/admin/admin');
    adminIDRef.once("value", function (adminID) {
      var adminUserRef = ref.child('auth/users/' + adminID.val());
      adminUserRef.once("value", function (adminUser) {
        console.log("gapi auth token");
        gapi.auth.setToken({
          access_token: adminUser.child('access_token').val()
        });
        $scope.accessToken = adminUser.child('access_token').val();
      });
    });


    courseMap.$loaded().then(function () {
      var seq = [];
      for (i = 0; i < courseMap.length; i++) {
        seq.push(courseMap[i]);
        $scope.chapters.push({ cid: courseMap[i].cid, chapterTitle: courseMap[i].chapterTitle });
      }
      $scope.courseMap = seq;
    });

    $scope.chapterMenu = function ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

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

          var courseSeq = contentMgmtService.getCourseSeq($routeParams.bid);
          courseSeq.$loaded().then(function (courseSeq) {
            angular.forEach(courseSeq, function (courseSeqValue, key) {

              if (courseSeqValue.cid === $scope.selectedChapter) {
                $scope.selectedChapterTitle = courseSeqValue.chapterTitle;
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
                }).then(function () {
                  contentMgmtService.getChapter(courseSeqValue.cid).then(function (chapter) {
                    chapter.$loaded().then(function () {
                      delete chapter.$$conf;
                      delete chapter.$id;
                      delete chapter.$priority;
                      exportObj["course"]["chapters"] = { chap: chapter };

                      contentMgmtService.getAdminSpreadsheetID().then(function (spreadsheetID) {

                        exportObj["spreadsheetID"] = spreadsheetID;
                        var jsonString = JSON.stringify(exportObj);
                        var url = URL.createObjectURL(new Blob([jsonString]));
                        var a = document.createElement('a');
                        a.href = url;
                        a.download = $scope.selectedChapterTitle + '_chapter_json.json';
                        a.target = '_blank';
                        a.click();

                        $mdDialog.hide();
                      });
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

    $scope.showImportPrompt = function (ev) {
      // Appending dialog to document.body to cover sidenav in docs app
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: ev,
        template:

        '<form name="qnsForm">' +
        '<md-dialog style="padding:20px; width:500px">' +
        ' <h3>Import options:</h3><br>' +
        '  <md-dialog-content>' +
        '    </br> ' +
        '    <label>Select the chapter content to import</label> </br>' +
        '   <choose-file layout="row"> ' +
        '     <input id="fileInput" type="file" class="ng-hide"> ' +
        '     <md-input-container flex class="md-block" > ' +
        '       <input type="text" ng-model="fileName"> ' +
        '     </md-input-container> ' +
        '     <div> ' +
        '       <md-button id="uploadButton" class="md-fab md-mini"> ' +
        '         <md-icon class="material-icons">attach_file</md-icon> ' +
        '       </md-button> ' +
        '     </div> ' +
        '   </choose-file> ' +
        '    <label style="color: red">{{fileError}}</label>' +
        '  <md-progress-linear md-mode="query" ng-show="loading"></md-progress-linear>' +
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

      function DialogController($scope, $mdDialog, chapters, contentMgmtService) {
        $scope.chapters = chapters;
        $scope.selectedChapter = '';
        $scope.closeDialog = function () {
          $mdDialog.hide();
        }

        $scope.nextStep = function () {
          $scope.loading = true;
          $scope.fileError = "";
          if ($scope.files) {
            var file = $scope.files[0];
            var reader = new FileReader();
            var ref = firebase.database().ref();
            var sequenceRef = ref.child('/library/' + contentMgmtService.getBookID() + '/sequence/');
            var questionRef = ref.child('/course/questions');
            var chapterRef = ref.child('/course/chapters');
            // Closure to capture the file information.
            reader.onload = (function (theFile) {
              return function (e) {
                try {
                  JsonObj = JSON.parse(e.target.result);

                  var answer = JsonObj.answerKey;
                  var sequence = JsonObj.courseSequence;
                  var question = JsonObj.course.questions;
                  var chapter = JsonObj.course.chapters;
                  var spreadsheetID = JsonObj.spreadsheetID;
                  var cid = "";

                  contentMgmtService.getAdminSpreadsheetID().then(function (userSpreadsheetID) {
                    //Add to course chapter
                    angular.forEach(chapter, function (chap, key) {
                      var chapRef = chapterRef.push(chap);
                      cid = chapRef.key;
                      ref.child('/course/chapters/' + cid).update({ helpRoomCode: cid });
                    });

                    importQuestions(question, spreadsheetID, userSpreadsheetID, answer).then(function (qnsList) {

                      sequence.cid = cid;
                      sequence.qns = qnsList;
                      // Add to sequence
                      sequenceRef.once("value", function (snapshot) {
                        sequenceRef.child(snapshot.numChildren()).set(sequence);
                        window.location.reload();
                      });
                    });

                  });
                } catch (err) {
                  $scope.fileError = "Please upload file in correct JSON format.";
                  $scope.loading = false;
                }
              };
            })(file);

            function importQuestions(question, spreadsheetID, userSpreadsheetID, answer) {
              var q = $q.defer();
              var qnsList = [];
              var totalQnsCount = 0;
              var currentQnsCount = 0
              //Add to course Question
              angular.forEach(question, function (qns, key) {
                totalQnsCount++;
                //if excel qns
                if (qns.qnsType == 'excel') {
                  contentMgmtService.copySpreadsheetQns($scope.accessToken, spreadsheetID, qns.sheetID, userSpreadsheetID).then(function (response) {

                    qns.sheetID = response;
                    var qnsRef = questionRef.push(qns);
                    var qid = qnsRef.key;
                    if (answer[key]) {
                      ref.child('/answerKey/' + qid).set(answer[key]);
                    }
                    qnsList.push({ qid: qid, qnsTitle: qns.qnsTitle, qnsType: qns.qnsType });
                    currentQnsCount++;
                    if (currentQnsCount == totalQnsCount) {
                      q.resolve(qnsList);
                    }
                  });
                } else {
                  currentQnsCount++;
                  var qnsRef = questionRef.push(qns);
                  var qid = qnsRef.key;
                  if (answer && answer[key]) {
                    ref.child('/answerKey/' + qid).set(answer[key]);
                  }
                  qnsList.push({ qid: qid, qnsTitle: qns.qnsTitle, qnsType: qns.qnsType });
                  if (currentQnsCount == totalQnsCount) {
                    q.resolve(qnsList);
                  }
                }
              });

              return q.promise;
            }

            // Read in the image file as a data URL.
            reader.readAsText(file);
          } else {
            $scope.fileError = "Failed to load file";
            $scope.loading = false;
          }
        }

      }
    };

    $scope.showPrompt = function (ev) {
      // Appending dialog to document.body to cover sidenav in docs app
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: ev,
        template:

        '<md-dialog style="padding:20px">' +
        '<form name="qnsForm">' +
        ' <h3>Options to create challenge:</h3><br>' +
        '  <md-dialog-content>' +
        '  <md-input-container style="width:500px;height:auto;">' +
        '    <label>Please select Chapter to put challenge in.</label> ' +
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
        '    <label>Select challenge Type.</label> ' +
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
          qnsTypes: $scope.qnsTypes,
          bid: $scope.bid
        },
        controller: DialogController
      });

      function DialogController($scope, $mdDialog, chapters, qnsTypes,bid) {
        $scope.chapters = chapters;
        $scope.selectedChapter = '';
        $scope.selectedQnsType = '';
        $scope.qnsTypes = qnsTypes;
        $scope.closeDialog = function () {
          $mdDialog.hide();
        }
        $scope.nextStep = function () {
          $scope.selectedQnsType = $scope.selectedQnsType.toLowerCase();

          $location.path('educator/' + $scope.selectedQnsType + '_create/' +bid+'/'+ $scope.selectedChapter);
          $mdDialog.hide();
        }
      }
    };

    $scope.editQuestion = function (qid, cid) {
      var question = contentMgmtService.getQuestion(qid);
      question.$loaded().then(function () {
        $location.path('educator/' + question.qnsType + '_edit/' +contentMgmtService.getBookID() + '/' + cid + '/' + qid);
      })
        .catch(function (error) {
          console.error("Error:", error);
        });
    }

    $scope.addChapter = function (ev) {
      // Appending dialog to document.body to cover sidenav in docs app
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: ev,
        template:

        '<md-dialog style="padding:20px">' +
        '<form name="qnsForm">' +
        ' <h3>Fill the form to create a new chapter</h3><br>' +
        '  <md-dialog-content>' +
        '  <md-input-container style="width:500px;height:auto;">' +
        '    <label>Chapter Title</label> ' +
        '    <input ng-model="chapterTitle" name="chapterTitle" required>' +
        '    <ng-messages for="qnsForm.chapterTitle.$error" md-auto-hide="true">' +
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
          courseMap: $scope.courseMap,
          chapters: $scope.chapters
        },
        controller: DialogController
      });

      function DialogController($scope, $mdDialog, courseMap, chapters, contentMgmtService) {
        $scope.chapterTitle = '';
        $scope.closeDialog = function () {
          $mdDialog.hide();
        }

        $scope.nextStep = function () {

          courseMap.push({ chapterTitle: $scope.chapterTitle });
          courseMap.forEach(function (v) { delete v.$id; delete v.$priority; });

          $("#text_" + (courseMap.length - 1)).show();
          $scope.chapterAdded = true;
          //window.scrollTo(0,document.body.scrollHeight);
          $('html, body').animate({ scrollTop: $(document).height() }, 'slow');
          $mdDialog.hide();
          $scope.chapterTitle = '';
          contentMgmtService.updateEntireSeq(courseMap).then(function (courseSeq) {
            chapters.push(courseSeq[courseSeq.length - 1]);
          });

        }
      }
    };

    $scope.saveAllChanges = function (ev) {

      var confirm = $mdDialog.confirm()
        .title('Would you want to save all changes?')
        .textContent('System will be saved to what you configured, is it ok to proceed?')
        .targetEvent(ev)
        .ok('Please do it!')
        .cancel('Cancel!');

      $mdDialog.show(confirm).then(function () {
        saveCourseSequence();
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

  function BookController($timeout, $http, $scope, $rootScope, $routeParams, $mdDialog, $location, $firebaseObject,$window,commonService, contentMgmtService) {

    $scope.library = [];
    // get library to display
    var library = contentMgmtService.getLibrary();
    library.$loaded().then(function () {
      for (i = 0; i < library.length; i++) {
        $scope.library.push({ bid: library[i].$id, bookTitle: library[i].bookTitle, bookDescription: library[i].bookDescription });
      }
    });

    $scope.saveBooksOrder = function(ev) {
      var confirm = $mdDialog.confirm()
        .title('Would you want to save the order of the books?')
        .textContent('System will be saved to what you configured, is it ok to proceed?')
        .targetEvent(ev)
        .ok('Save!')
        .cancel('Cancel!');

        $mdDialog.show(confirm).then(function () {
          var books=[];
          $("div.books").each(function (index, value) {
            var b = $(this).find('div#bid');
            var bid = b.attr('bid');
            books.push(bid);
          });

          contentMgmtService.updateBookOrder(books).then(function(){
            $window.location.reload();
          });
        });
    }

    $scope.addBook = function (ev) {
      // Appending dialog to document.body to cover sidenav in docs app
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: ev,
        template:

        '<md-dialog style="padding:20px">' +
        '<form name="qnsForm">' +
        ' <h3>Fill the form to create a new Book</h3><br>' +
        '  <md-dialog-content>' +
        '  <md-input-container style="width:500px;height:auto;">' +
        '    <label>Book Title Title</label> ' +
        '    <input ng-model="bookTitle" name="bookTitle" required>' +
        '    <ng-messages for="qnsForm.bookTitle.$error" md-auto-hide="true">' +
        '      <div ng-message="required">This is required.</div>' +
        '    </ng-messages>' +
        '  </md-input-container><br>' +
        '  <md-input-container style="width:500px;height:auto;">' +
        '    <label>Book Description</label> ' +
        '    <textarea ng-model="bookDescription" name="bookDescription" md-maxlength="150" rows="3" required></textarea>' +
        '    <ng-messages for="qnsForm.bookDescription.$error" md-auto-hide="true">' +
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
          library: $scope.library
          // courseMap: $scope.courseMap,
          // chapters: $scope.chapters
        },
        controller: DialogController
      });

      function DialogController($scope, $mdDialog, library, contentMgmtService) {

        $scope.closeDialog = function () {
          $mdDialog.hide();
        }

        $scope.nextStep = function () {
          var newBook = {};

          newBook["bookTitle"] = $scope.bookTitle;
          newBook["bookDescription"] = $scope.bookDescription;

          contentMgmtService.updateBook(newBook, true).then(function (bookNode) {
            library.push(bookNode);
            $mdDialog.hide();
          });
          // courseMap.push({ chapterTitle: $scope.chapterTitle });
          // courseMap.forEach(function (v) { delete v.$id; delete v.$priority; });

          // $("#text_" + (courseMap.length - 1)).show();
          // $scope.chapterAdded = true;

          // $('html, body').animate({ scrollTop: $(document).height() }, 'slow');
          // $mdDialog.hide();
          // $scope.chapterTitle = '';
          // contentMgmtService.updateEntireSeq(courseMap).then(function (courseSeq) {
          //   chapters.push(courseSeq[courseSeq.length - 1]);
          // });

        }
      }
    };

    $scope.editBook = function (ev, bookTitle, bookDescription, bid) {
      // Appending dialog to document.body to cover sidenav in docs app
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: ev,
        template:

        '<md-dialog style="padding:20px">' +
        '<form name="qnsForm">' +
        ' <h3>Edit Book Details</h3><br>' +
        '  <md-dialog-content>' +
        '  <md-input-container style="width:500px;height:auto;">' +
        '    <label>Book Title </label> ' +
        '    <input ng-model="bookTitle" name="bookTitle" required>' +
        '    <ng-messages for="qnsForm.bookTitle.$error" md-auto-hide="true">' +
        '      <div ng-message="required">This is required.</div>' +
        '    </ng-messages>' +
        '  </md-input-container><br>' +
        '  <md-input-container style="width:500px;height:auto;">' +
        '    <label>Book Description</label> ' +
        '    <textarea ng-model="bookDescription" name="bookDescription" md-maxlength="150" rows="3" required></textarea>' +
        '    <ng-messages for="qnsForm.bookDescription.$error" md-auto-hide="true">' +
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
          bid: bid,
          bookTitle: bookTitle,
          bookDescription: bookDescription,
          library: $scope.library
          // courseMap: $scope.courseMap,
          // chapters: $scope.chapters
        },
        controller: DialogController
      });

      function DialogController($scope, $mdDialog, bookTitle, bookDescription, bid, library, contentMgmtService) {
        $scope.bookDescription = bookDescription;
        $scope.bookTitle = bookTitle;

        $scope.closeDialog = function () {
          $mdDialog.hide();
        }

        $scope.nextStep = function () {
          var newBook = {};
          newBook["bid"] = bid;
          newBook["bookTitle"] = $scope.bookTitle;
          newBook["bookDescription"] = $scope.bookDescription;
          contentMgmtService.updateBook(newBook, false);
          library.forEach(function (v) {
            if (v.bid == bid) {
              v.bookTitle = $scope.bookTitle;
              v.bookDescription = $scope.bookDescription;
              return false;
            }
          });
          $mdDialog.hide();

        }
      }
    };

    $scope.confirmDelete = function (ev, bookTitle, bid) {

      var confirm = $mdDialog.confirm()
        .title('Delete book titled "' + bookTitle + '"?')
        .textContent('Everything related to this book will be deleted, is it ok to proceed?')
        .targetEvent(ev)
        .ok('Do it!')
        .cancel('Cancel!');

      $mdDialog.show(confirm).then(function () {
        contentMgmtService.deleteBook(bid);
        $scope.library.forEach(function (v, index) {
          if (v.bid == bid) {
            $scope.library.splice(index, 1);
            return false;
          }
        });
      });
    }

    $scope.viewBook = function (bid) {
      $location.path('educator/bookMap/' + bid);
    }

    $scope.courseMenu = function ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

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
        '    <label>Please select book to export.</label> ' +
        '    <md-select ng-model="selectedBook" name="book" required>' +
        '      <md-option ng-repeat="book in library" value="{{book.bid}}">' +
        '       {{book.bookTitle}}' +
        '      ' +
        '    </md-option></md-select>' +
        '    <ng-messages for="qnsForm.book.$error" md-auto-hide="true">' +
        '      <div ng-message="required">This is required.</div>' +
        '    </ng-messages>' +
        '  </md-input-container><br>' +
        '  </md-dialog-content>' +
        '  <md-dialog-actions>' +
        '    <md-button ng-click="closeDialog()" class="md-primary">' +
        '      Close' +
        '    </md-button>' +
        '    <md-button type="submit" ng-click="qnsForm.$valid && nextStep()" class="md-primary">' +
        '      Export' +
        '    </md-button>' +
        '  </md-dialog-actions>' +
        '</form>' +
        '</md-dialog>',
        locals: {
          library: $scope.library
        },
        controller: DialogController
      });

      function DialogController($scope, $q, $mdDialog, $firebaseObject, $firebaseArray, library) {
        $scope.library = library;
        $scope.selectedBook = '';
        var ref = firebase.database().ref();
        var answerKeyNode = $firebaseArray(ref.child('answerKey'));
        var questionNode = $firebaseArray(ref.child('course/questions'));

        $scope.closeDialog = function () {
          $mdDialog.hide();
        }

        $scope.nextStep = function () {

          var exportObj = {};
          var course = {};
          var chapters = {};
          var questions = {};
          var answerKey = {};
          var book = $firebaseObject(ref.child('library').child($scope.selectedBook));

          var promises = [book, answerKeyNode, questionNode];

          book.$loaded().then(function () {
            $scope.bookTitle = book.bookTitle;
            var courseSeq = book.sequence;
            angular.forEach(courseSeq, function (chapter, key) {
              chapters[chapter.cid] = chapter;

              // loop through questions

              angular.forEach(chapter.qns, function (qnsValue, key) {
                var q = questionNode.$getRecord(qnsValue.qid);
                if (q != null) {
                  delete q.$$conf;
                  delete q.$id;
                  delete q.$priority;
                  questions[qnsValue.qid] = q;
                }

                var ans = answerKeyNode.$getRecord(qnsValue.qid);
                if (ans != null) {
                  delete ans.$$conf;
                  delete ans.$id;
                  delete ans.$priority;
                  answerKey[qnsValue.qid] = ans;
                }

              });
            });
          }).then(function () {

            exportObj["answerKey"] = answerKey;
            exportObj["course"] = { questions: questions, chapters: chapters };
            var bookNode = {};
            delete book.$$conf;
            delete book.$id;
            delete book.$priority;
            bookNode[$scope.selectedBook] = book;
            exportObj['book'] = bookNode;

            contentMgmtService.getAdminSpreadsheetID().then(function (spreadsheetID) {
              exportObj["spreadsheetID"] = spreadsheetID;
              var jsonString = JSON.stringify(exportObj);
              var url = URL.createObjectURL(new Blob([jsonString]));
              var a = document.createElement('a');
              a.href = url;
              a.download = $scope.bookTitle + '_json.json';
              a.target = '_blank';
              a.click();

              $mdDialog.hide();
            });
          });
        }
      }
    };

    $scope.importCourse = function (ev) {
      // Appending dialog to document.body to cover sidenav in docs app
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: ev,
        template:

        '<form name="qnsForm">' +
        '<md-dialog style="padding:20px; width:500px">' +
        ' <h3>Import options:</h3><br>' +
        '  <md-dialog-content>' +
        '    </br> ' +
        '    <label>Select the course content to import</label> </br>' +
        '   <choose-file layout="row"> ' +
        '     <input id="fileInput" type="file" class="ng-hide"> ' +
        '     <md-input-container flex class="md-block" > ' +
        '       <input type="text" ng-model="fileName"> ' +
        '     </md-input-container> ' +
        '     <div> ' +
        '       <md-button id="uploadButton" class="md-fab md-mini"> ' +
        '         <md-icon class="material-icons">attach_file</md-icon> ' +
        '       </md-button> ' +
        '     </div> ' +
        '   </choose-file> ' +
        '    <label style="color: red">{{fileError}}</label>' +
        '  <md-progress-linear md-mode="query" ng-show="loading"></md-progress-linear>' +
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


      function DialogController($scope, $q, $mdDialog, $timeout, chapters, contentMgmtService) {
        var ref = firebase.database().ref();
        //Load Google Auth
        var adminIDRef = ref.child('auth/admin/admin');
        adminIDRef.once("value", function (adminID) {
          var adminUserRef = ref.child('auth/users/' + adminID.val());
          adminUserRef.once("value", function (adminUser) {
            console.log("gapi auth token");
            gapi.auth.setToken({
              access_token: adminUser.child('access_token').val()
            });
            $scope.accessToken = adminUser.child('access_token').val();
          });
        });

        $scope.chapters = chapters;
        $scope.selectedChapter = '';

        var ref = firebase.database().ref();
        var libraryRef = ref.child('/library/');
        //var sequenceRef
        var questionRef = ref.child('/course/questions');
        var chapterRef = ref.child('/course/chapters');

        $scope.closeDialog = function () {
          $mdDialog.hide();
        }

        $scope.nextStep = function () {
          $scope.fileError = "";
          if ($scope.files) {
            var file = $scope.files[0];
            var reader = new FileReader();


            // Closure to capture the file information.
            reader.onload = (function (theFile) {
              return function (e) {
                // try {
                $scope.loading = true;
                importCourse(e).then(function () {
                  $timeout(function () { window.location.reload(); }, 1000);
                });

              };
            })(file);

            // Read in the image file as a data URL.
            reader.readAsText(file);
          } else {
            $scope.loading = false;
            $scope.fileError = "Failed to load file";
          }
        }

        function importCourse(e) {
          var nbook = {};
          var q = $q.defer();
          JsonObj = JSON.parse(e.target.result);
          var answer = JsonObj.answerKey;
          var book = JsonObj.book;
          var question = JsonObj.course.questions;
          var chapter = JsonObj.course.chapters;
          var spreadsheetID = JsonObj.spreadsheetID;

          angular.forEach(book, function (bookContent, bookID) {

            nbook.bookDescription = bookContent.bookDescription;
            nbook.bookTitle = bookContent.bookTitle;
            var sequences = bookContent.sequence;

            importSequence(sequences, answer, question, chapter, spreadsheetID).then(function (seqList) {
              nbook.sequence = seqList;

              // Add to firebase
              libraryRef.push(nbook);
              q.resolve(true);
            });

          });
          return q.promise;
        }

        function importSequence(sequences, answer, question, chapter, spreadsheetID) {
          var q = $q.defer();
          var seqList = [];
          contentMgmtService.getAdminSpreadsheetID().then(function (userSpreadsheetID) {
            var numChapter = sequences.length;

            angular.forEach(sequences, function (sequence, key) {

              var cid = "";
              angular.forEach(chapter, function (chap, key) {
                if (key == sequence.cid) {
                  var chapRef = chapterRef.push(chap);
                  cid = chapRef.key;
                  ref.child('/course/chapters/' + cid).update({ helpRoomCode: cid });
                }
              });

              importQuestions(sequence.qns, question, spreadsheetID, userSpreadsheetID, answer).then(function (qnsList) {

                sequence.cid = cid;
                sequence.qns = qnsList;

                seqList.push(sequence);
                if (seqList.length == numChapter) {
                  q.resolve(seqList);
                }
              });
            });
          });
          return q.promise;
        }

        function importQuestions(sequenceQns, questionList, spreadsheetID, userSpreadsheetID, answer) {
          var q = $q.defer();
          var totalQnsCount = 0;
          var currentQnsCount = 0;
          var qnsList = [];

          if (sequenceQns) {
            angular.forEach(sequenceQns, function (seqQns, seqKey) {
              angular.forEach(questionList, function (qns, qnsKey) {
                if (seqQns.qid == qnsKey) {
                  totalQnsCount++
                  importQuestion(qns, spreadsheetID, userSpreadsheetID, answer).then(function (nQns) {
                    var qnsRef = questionRef.push(nQns);
                    var qid = qnsRef.key;
                    if (answer[qnsKey]) {
                      ref.child('/answerKey/' + qid).set(answer[qnsKey]);
                    }
                    qnsList.push({ qid: qid, qnsTitle: nQns.qnsTitle, qnsType: nQns.qnsType });
                    currentQnsCount++;
                    if (currentQnsCount == totalQnsCount) {
                      q.resolve(qnsList);
                    }
                  });
                }
              });
            });
          } else {
            q.resolve(qnsList);
          }
          return q.promise;
        }

        function importQuestion(qns, spreadsheetID, userSpreadsheetID, answer) {
          var q = $q.defer();

          //if excel qns
          if (qns.qnsType == 'excel' && spreadsheetID != -1 && userSpreadsheetID != -1) {
            contentMgmtService.copySpreadsheetQns($scope.accessToken, spreadsheetID, qns.sheetID, userSpreadsheetID).then(function (response) {
              qns.sheetID = response;
              q.resolve(qns);
            });
          } else {
            q.resolve(qns);
          }
          return q.promise;
        }


      }
    };
  }


})();
