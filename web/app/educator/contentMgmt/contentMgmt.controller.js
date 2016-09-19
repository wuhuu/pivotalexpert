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
                        collapsible: true
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
            $("#text_"+id).hide();
            angular.forEach(scope.mcqObj.options,function(value,key){
              $("#text_"+id+"_"+key).hide();
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

  function ContentMgmtController($http,$scope, $routeParams, $location,$firebaseArray,$mdDialog, $firebaseObject,contentMgmtService) {
	  console.log("ContentMgmtController");
    var qid = $routeParams.qid;
    $scope.qid = qid;
    var question = contentMgmtService.getQuestion(qid);
    question.$loaded().then(function() {
      var answer = contentMgmtService.getAnswerKey(qid)
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
      });
    })
    .catch(function(error) {
      console.error("Error:", error);
    });

    $scope.saveQns = function(ev) {
      var confirm = $mdDialog.confirm()
            .title('Would you want to save all changes?')
            .textContent('This question will be saved to what you configured, is it ok to proceed?')
            .targetEvent(ev)
            .ok('Please do it!')
            .cancel('Cancel!');

      $mdDialog.show(confirm).then(function() {
        if(question.qnsType == "video"){
          contentMgmtService.updateVideoQuestion($scope.qns,false).then(function(){
            window.location.reload();
          });
        }else if (question.qnsType == "slides") {
          contentMgmtService.updateSlideQuestion($scope.qns,false).then(function(){
            window.location.reload();
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

          contentMgmtService.updateMCQ($scope.qns,false).then(function(){
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
    }

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
  }

  function CourseMapController($http,$scope, $routeParams,$mdDialog, $location, $firebaseObject, contentMgmtService) {
    $scope.chapTBD = [];
    $scope.qnsTBD = [];
    var courseMap = contentMgmtService.getCourseSeq();
    courseMap.$loaded().then(function(){
      var seq = [];
      for(i=0;i<courseMap.length;i++) {
        seq.push(courseMap[i]);
      }

      $scope.courseMap = seq;
    });

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

        
        contentMgmtService.deleteQuestion($scope.qnsTBD);
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
