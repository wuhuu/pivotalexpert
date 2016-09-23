(function() {

  angular
    .module('app.contentMgmt')
    .controller('ContentMgmtController', ContentMgmtController)
    .controller('CourseMapController',CourseMapController)
    .directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    $( ".accordion1" )
                      .accordion({
                        header: "> div > #chapterHeader",
                        collapsible: true,
                        heightStyle: "content"
                      })
                      .sortable({
                        collapsible: true,
                        axis: "y",
                        handle: "#chapterHeader",
                        stop: function( event, ui ) {
                          // IE doesn't register the blur when sorting
                          // so trigger focusout handlers to remove .ui-state-focus
                          ui.item.children( "#chapterHeader" ).triggerHandler( "focusout" );

                          // Refresh accordion to handle new order
                          $( this ).accordion( "refresh" );
                        }
                      });

                   $( ".accordion2" ).sortable();

                     
                });
            }
            $timeout(function(){
              var cid =  scope.$index;
              if(! scope.chapterAdded){
                $("#text_"+cid).hide();
              }
               $("#text_"+cid).focusout(function(){
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

            $("#text_"+id).focusout(function(){
                  $(this).hide();
            });

            if(! scope.qnsAdded) {               
              $("#text_"+id).hide();
            }
            angular.forEach(scope.mcqObj.options,function(value,key){
              $("#text_"+id+"_"+key).hide();
              $("#text_"+id+"_"+key).focusout(function(){
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
    });

  function ContentMgmtController($http,$scope, $routeParams, $location,$firebaseArray,$mdDialog, $firebaseObject,contentMgmtService, $sce) {
	  console.log("ContentMgmtController");
    
    //Delete Qns
    $scope.deleteQns = function(ev,cid,qid) {
      var confirm = $mdDialog.confirm()
            .title('Do you really want to DELETE this question?')
            .textContent('This question will deleted, is it ok to proceed?')
            .targetEvent(ev)
            .ok('Delete it now!')
            .cancel('Cancel');

      $mdDialog.show(confirm).then(function() {
        contentMgmtService.deleteQuestion(cid,qid).then(function(){
         window.location.href = "#/educator/courseMap"
         //window.location.reload();
        });
      }, function() {
        // cancel function
      });
    }

    //Delete Chapter
    $scope.deleteChap = function(ev,cid) {
      var confirm = $mdDialog.confirm()
            .title('Do you really want to DELETE this question?')
            .textContent('This question will deleted, is it ok to proceed?')
            .targetEvent(ev)
            .ok('Delete it now!')
            .cancel('Cancel');

      $mdDialog.show(confirm).then(function() {
        contentMgmtService.deleteChapter(cid).then(function(){
          window.location.reload();
        });
      }, function() {
        // cancel function
      });
    }
 
    if($routeParams.qid!=null) {
        var qid = $routeParams.qid;
        $scope.qid = qid;
        $scope.isNewQuestion = false;
        var question = contentMgmtService.getQuestion(qid);
        question.$loaded().then(function() {
          var answer = contentMgmtService.getAnswerKey(qid);
          answer.$loaded().then(function(answerKey){
            if(answerKey && question.qnsType==='mcq') {
              angular.forEach(question.mcq, function(value, key) {
                var ans = answerKey.answer[key];
                value.answer = ans;
              });
            }
            question.qid = question.$id;
            question.cid = $routeParams.cid;
            $scope.qns = question;
          
            if (question.qnsType === "code") {
                //answer key scope
            
                //Set code box display
                var editor = ace.edit("editor");
                editor.setTheme("ace/theme/chrome");
                editor.getSession().setMode("ace/mode/javascript");
                editor.setOption("maxLines", 30);
                editor.setOption("minLines", 10);
            }
           });
        })
        .catch(function(error) {
          console.error("Error:", error);
        });
        
        
    }else {
      //"/educator/slides_create/C0"
      var path = $location.$$path;
      path = path.substr(path.indexOf('/educator/'),path.indexOf('_create'));
      var qnsType= path.substr(path.lastIndexOf('/')+1);
      $scope.isNewQuestion = true;
      $scope.qns = {qnsTitle:" ",qnsType:qnsType,cid:$routeParams.cid}
      if(qnsType === "slides"){
        $scope.qns['slides'] = [];
      }else if (qnsType === "video"){
        $scope.qns['qnsDescription'] = "";
        $scope.qns['qnsInstruction'] = "";
        $scope.qns['link'] = "";
      }else if (qnsType === "mcq"){
        $scope.qns['mcq'] = [];
        $scope.qns['hint'] = "";
        $scope.qns['qnsInstruction'] = [];
      } else if (qnsType === "excel") {
          
        $scope.qns['hint'] = "";
        $scope.qns['qnsInstruction'] = "";
        $scope.qns['sheetID'] = "";
        //answer key scope
        $scope.qns['range'] = "";
        $scope.qns['FormulaCell'] = "";
        $scope.qns['FormulaUsed'] = "";
        $scope.qns['answer'] = [];
        
      } else if (qnsType === "code") {
        $scope.qns['hint'] = "";
        $scope.qns['qnsInstruction'] = "";
        $scope.qns['initialCode'] = "";
        //answer key scope
        $scope.qns['testcases'] = [];
        $scope.qns['testcodeDeclare'] = "";
        $scope.qns['testcode'] = "";
        
        //Set code box display
        var editor = ace.edit("editor");
        editor.setTheme("ace/theme/chrome");
        editor.getSession().setMode("ace/mode/javascript");
        editor.setOption("maxLines", 30);
        editor.setOption("minLines", 10);
      }
    }

    //video & Slides Save Qns
    $scope.saveQns = function(ev) {
      var confirm = $mdDialog.confirm()
            .title('Would you want to save all changes?')
            .textContent('This question will be saved to what you configured, is it ok to proceed?')
            .targetEvent(ev)
            .ok('Please do it!')
            .cancel('Cancel!');

      $mdDialog.show(confirm).then(function() {
        if($scope.qns.qnsType == "video"){
          contentMgmtService.updateVideoQuestion($scope.qns,$scope.isNewQuestion).then(function(){
            window.location.href = "#/educator/courseMap"
          });
        }else if ($scope.qns.qnsType == "slides") {
          contentMgmtService.updateSlideQuestion($scope.qns,$scope.isNewQuestion).then(function(){
            window.location.href = "#/educator/courseMap"
          });
        }
      });

    }

    $scope.deleteSlide = function(index){
      $scope.qns.slides.splice(index,1);
    }

    $scope.addSlide = function(){
      $scope.qns.slides.push({explanation:" ",imageLink:" "});
    }

    $scope.toggleQns = function(id) {
      $("#text_"+id).toggle();
    }

    $scope.toggleChoice = function(id,index) {
      $("#text_"+id+"_"+index).toggle();
    }

    // mcq
    $scope.addChoice = function(mcq_id) {
      var length = $scope.qns.mcq[mcq_id].options.length;
      $scope.qns.mcq[mcq_id].options.push("Choice "+ (length+1));
      
      $("#text_"+mcq_id+"_"+length).hide();
    }

    $scope.saveMCQChanges = function(ev) {
    // Appending dialog to document.body to cover sidenav in docs app
      var confirm = $mdDialog.confirm()
            .title('Would you want to save all changes?')
            .textContent('This question will be saved to what you configured, is it ok to proceed?')
            .targetEvent(ev)
            .ok('Please do it!')
            .cancel('Cancel!');

      $mdDialog.show(confirm).then(function() {
        
        var listToUpdate = [];
        var qns = $scope.qns;
        var mcqList = qns.mcq;
        var qids = $("#mcq").find('strong');
        // updating the question sequence
          for(i=0;i<qids.length;i++) {
              var qid =qids[i].innerText.replace('.','');
              $.each(mcqList,function(index, value){
                if(value.qnsID === qid) {
                  listToUpdate.push(mcqList[index]);
                  return false;
                }
              });
          }
          $scope.qns.mcq = listToUpdate;

          contentMgmtService.updateMCQ($scope.qns,$scope.isNewQuestion).then(function(){
            window.location.reload();
          });
        }, function() {
          // cancel function
        });

    };    

    $scope.deleteChoice = function(mcq_id,index){
      $scope.qns.mcq[mcq_id].options.splice(index,1);
    }

    $scope.deleteMcq = function(index){
      $scope.qns.mcq.splice(index,1);
    }

    $scope.addMcq = function() {
      var qnsID = "Q"+($scope.qns.mcq.length+1);
      $scope.qns.mcq.push({options:[],qns:"",qnsID:qnsID});
      $scope.qnsAdded = true;
    }

    //Excel
    if(qnsType = "excel") {
        //load user spreadsheetId
        var user = firebase.auth().currentUser;
        var ref = firebase.database().ref();
        var currentUser = $firebaseObject(ref.child('auth/users/' + user.uid));
        currentUser.$loaded().then(function(){
            $scope.userExcelID = currentUser.driveExcel;
            //$scope.userToken = currentUser.access_token;
            var excelLink = "https://docs.google.com/spreadsheets/d/" + $scope.userExcelID + "/edit?usp=sharing"
            $scope.srclink = $sce.trustAsResourceUrl(excelLink);
            var discoveryUrl = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
            gapi.client.load(discoveryUrl).then(createSheet);
        });
    }
    
    function createSheet() {
        gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: $scope.userExcelID,
            requests: [
              {
                addSheet:{
                  properties:{
                    title: "New Question Create",
                  }
                }
              }
            ]
        }).then(function(response) {
            $scope.qns.sheetID = (response.result.replies[0].addSheet.properties.sheetId);
        });
    }
    
    //Add more cell answer
    $scope.addCellAnswer = function() {
        $scope.qns.answer.push({col: "", row: "", value: ""});
    }
    
    //Create && Update
    $scope.saveExcelChanges = function(ev) {
    // Appending dialog to document.body to cover sidenav in docs app
      var confirm = $mdDialog.confirm()
            .title('Would you want to save all changes?')
            .textContent('This question will be saved to what you configured, is it ok to proceed?')
            .targetEvent(ev)
            .ok('Please do it!')
            .cancel('Cancel!');

      $mdDialog.show(confirm).then(function() {
          
        var formulaCell = String($scope.qns.FormulaCell);
        var col = formulaCell.charAt(0).toUpperCase();
        var row = parseInt(formulaCell.substring(1));
        $scope.qns.FormulaCell = {col:col, row:row };
        var discoveryUrl = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
        gapi.client.load(discoveryUrl).then(updateSheetTitle);
            
        contentMgmtService.updateExcel($scope.qns,$scope.isNewQuestion).then(function(result){
              console.log(result);
            //window.location.reload();
          });
        }, function() {
          // cancel function
        });
    };
    
    function updateSheetTitle() {
        gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: $scope.userExcelID,
            requests: [
              {
                updateSheetProperties:{
                  properties:{
                    title: $scope.qns.qnsTitle,
                    sheetId : $scope.qns.sheetID
                  },
                  fields: "title"
                }
              }
            ]
        }).then(function(response) {
            $scope.qns.sheetID = (response.result.replies[0].addSheet.properties.sheetId);
        });
    }
    
    
    
    // Code box
    //Add more test cases
    $scope.addTestcase = function() {
        $scope.qns.testcases.push({testcase: ""});
    }
    
    
    //Create && Update
    $scope.saveCodeBoxChanges = function(ev) {
    // Appending dialog to document.body to cover sidenav in docs app
      var confirm = $mdDialog.confirm()
            .title('Would you want to save all changes?')
            .textContent('This question will be saved to what you configured, is it ok to proceed?')
            .targetEvent(ev)
            .ok('Please do it!')
            .cancel('Cancel!');

      $mdDialog.show(confirm).then(function() {
          
          $scope.qns.initialCode = editor.getValue();
          
          contentMgmtService.updateCodebox($scope.qns,$scope.isNewQuestion).then(function(result){
              console.log(result);
            window.location.reload();
          });
        }, function() {
          // cancel function
        });

    };
 }

  function CourseMapController($http,$scope, $routeParams,$mdDialog, $location, $firebaseObject, contentMgmtService) {
    $scope.chapTBD = [];
    $scope.qnsTBD = [];
    $scope.chapters = [];
    $scope.qnsTypes = ["Video","Slides","MCQ","Excel","Code"];
    var courseMap = contentMgmtService.getCourseSeq();
    
    courseMap.$loaded().then(function(){
      var seq = [];
      for(i=0;i<courseMap.length;i++) {
        seq.push(courseMap[i]);
        $scope.chapters.push({cid:courseMap[i].cid,chapterTitle:courseMap[i].chapterTitle});
      }

      $scope.courseMap = seq;
    });

    $scope.showPrompt = function(ev) {
    // Appending dialog to document.body to cover sidenav in docs app
      var parentEl = angular.element(document.body);
       $mdDialog.show({
         parent: parentEl,
         targetEvent: ev,
         template:
         
          '<md-dialog style="padding:20px">' +
          '<h3>Options to create question:</h3><br>'+
           '  <md-dialog-content>'+
           '  <md-input-container style="width:500px;height:auto;">'+
           '    <label>Select Chapter to put question in.</label> '+
           '    <md-select ng-model="selectedChapter" required>'+
           '      <md-option ng-repeat="item in chapters" value="{{item.cid}}">'+
           '       {{item.chapterTitle}}' +
           '      '+
           '    </md-option></md-select></md-input-container><br>'+
           '  <md-input-container style="width:500px;height:auto;">'+    
           '    <label>Select question Type.</label> '+
           '    <md-select ng-model="selectedQnsType" required>'+
           '      <md-option ng-repeat="item in qnsTypes" value="{{item}}">'+
           '       {{item}}' +
           '      '+
           '    </md-option></md-select>'+
           '  </md-input-container>'+
           '  </md-dialog-content>' +
           '  <md-dialog-actions>' +
           '    <md-button ng-click="closeDialog()" class="md-primary">' +
           '      Close' +
           '    </md-button>' +
           '    <md-button ng-click="nextStep()" class="md-primary">' +
           '      Proceed' +
           '    </md-button>' +
           '  </md-dialog-actions>' +
           '</md-dialog>',
         locals: {
           chapters: $scope.chapters,
           qnsTypes:$scope.qnsTypes
         },
         controller: DialogController
      });
      function DialogController($scope, $mdDialog,chapters,qnsTypes) {
        $scope.chapters = chapters;
        $scope.selectedChapter = '';
        $scope.selectedQnsType = '';
        $scope.qnsTypes = qnsTypes;
        $scope.closeDialog = function() {
          $mdDialog.hide();
        }
        $scope.nextStep = function() {
          $scope.selectedQnsType = $scope.selectedQnsType.toLowerCase();
          
          $location.path('educator/'+$scope.selectedQnsType+'_create/'+$scope.selectedChapter);
          $mdDialog.hide();
        }
      }
    };

    $scope.editQuestion = function(qid,cid) {
      var question = contentMgmtService.getQuestion(qid);
      question.$loaded().then(function() {
        $location.path('educator/'+question.qnsType+'_edit/'+cid+'/'+qid);
      })
      .catch(function(error) {
        console.error("Error:", error);
      });
    }

    $scope.addChapter = function(){
      $scope.courseMap.push({chapterTitle:"",});
      $("#text_"+($scope.courseMap.length-1)).show();
      $scope.chapterAdded = true;
      //window.scrollTo(0,document.body.scrollHeight); 
      $('html, body').animate({scrollTop:$(document).height()}, 'slow');
    }

    $scope.saveAllChanges = function(ev) {

      var confirm = $mdDialog.confirm()
            .title('Would you want to save all changes?')
            .textContent('System will be saved to what you configured, is it ok to proceed?')
            .targetEvent(ev)
            .ok('Please do it!')
            .cancel('Cancel!');

      $mdDialog.show(confirm).then(function() {
        
        var courseSequence = [];
        var chap ={};
        var qlist =[];
        var qns ={};
        $( "div#chapter" ).each(function( index, value ) {
          var c = $(this).find('h2.cid');
          console.log(index + ":" + $(this).attr('id'));
          var cid = c.attr('cid');
          var title = c.text().trim();
          chap['cid'] = cid;
          chap['chapterTitle']=title;
          var qElements = $(this).find('h4.question');

          // all question here
          for(i=0;i<qElements.length;i++) {
            var obj = qElements[i];
            console.log("questionid: "+ obj.id);
            qns['qid']=obj.id;
            qns['qnsTitle']= obj.textContent;
            qns['qnsType']= obj.getAttribute("qnsType");
            qlist.push(qns);
            qns ={};
          }

          chap['qns']=qlist;
          courseSequence.push(chap);
          chap={};
          qlist=[];

        });
        
        contentMgmtService.deleteQuestionFromCM($scope.qnsTBD);
        contentMgmtService.deleteChapter($scope.chapTBD).then(function(){
          contentMgmtService.updateEntireSeq(courseSequence).then(function() {
            window.location.reload();
          });
        });
        
        //$location.path('/educator/courseMap');
      });
    }

    $scope.deleteChapter = function(index,cid){
      $scope.courseMap.splice(index,1);
      $scope.chapTBD.push(cid); 
    }

    $scope.deleteQuestion = function(chapterIndex,index,qid){
      $scope.courseMap[chapterIndex].qns.splice(index,1);
      $scope.qnsTBD.push(qid);
    }

    $scope.toggleChapterTextbox = function(id) {
      $("#text_"+id).toggle();
    } 

  }

})();
