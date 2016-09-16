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
                        header: "> div > h2",
                        collapsible: true
                      })
                      .sortable({
                        collapsible: true,
                        axis: "y",
                        handle: "h2",
                        stop: function( event, ui ) {
                          // IE doesn't register the blur when sorting
                          // so trigger focusout handlers to remove .ui-state-focus
                          ui.item.children( "h2" ).triggerHandler( "focusout" );

                          // Refresh accordion to handle new order
                          $( this ).accordion( "refresh" );
                        }
                      });

                   $( ".accordion2" )
                      .sortable({
                        stop: function( event, ui ) {
                          // IE doesn't register the blur when sorting
                          // so trigger focusout handlers to remove .ui-state-focus
                          //ui.item.children( "md-item-content" ).triggerHandler( "focusout" );
                          // if ($(ui.item).hasClass('.sublist') && $(ui.placeholder).parent()[0] != this) {
                          //     $(this).sortable('cancel');
                          // }
                          // Refresh accordion to handle new order
                          // $( this ).accordion( "refresh" );
                        }
                      });   
                });
            }
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
        }
      }
    });

  function ContentMgmtController($http,$scope, $routeParams, $location,$firebaseArray, $firebaseObject,contentMgmtService) {
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
            value.ans = ans;
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

    $scope.saveQns = function() {
      if(question.qnsType == "video"){
        contentMgmtService.updateVideoQuestion($scope.qns,false).then(function(){
          window.location.reload();
        });
      }else if (question.qnsType == "slides") {
        contentMgmtService.updateSlideQuestion($scope.qns,false).then(function(){
          window.location.reload();
        });
      }

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
      $scope.qns.mcq[mcq_id].options.push("type something_"+length);
      
      var choice = "<div layout='row' style='margin: -15px 0'><div layout='row' layout-align='center center'>"
                   + "<md-button ng-click='toggleChoice("+mcq_id+","+length+")'class='md-icon-button' aria-label='Settings'>"
                    +"<i class='fa fa-pencil'></i></md-button><md-button class='md-icon-button' aria-label='Settings'>"
                    +"<i class='fa fa-times'></i></md-button></div><md-radio-button value='"+
                    $scope.qns.mcq[mcq_id].options[length]+"'> "+$scope.qns.mcq[mcq_id].options[length]+" </md-radio-button>"
                     +"<md-input-container class='md-block' id='text_"+mcq_id+"_"+length+"'><label>Choice:</label>" 
                    +"<input ng-change='change()' ng-model='"+$scope.qns.mcq[mcq_id].options[length]+"'></md-input-container> </div>";


      $('#choice_'+mcq_id).append(choice);
      $("#text_"+mcq_id+"_"+length).hide();
    }

    $scope.saveAllChanges = function(mcq){
      var qns = $scope.qns;
    }
  }

  function CourseMapController($http,$scope, $routeParams, $location, $firebaseObject, contentMgmtService) {

    var courseMap = contentMgmtService.getCourseSeq();
    courseMap.$loaded().then(function(){
      $scope.courseMap = courseMap;
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

    $scope.saveSeq = function() {
      var courseSequence = [];
      var chap ={};
      var qlist =[];
      var qns ={};
      $( "div#chapter" ).each( function( index, value ) {
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
          qlist.push(qns);
          qns ={};
        }

        chap['qns']=qlist;
        courseSequence.push(chap);
        chap={};
        qlist=[];

      });

      
      contentMgmtService.updateEntireSeq(courseSequence);
      window.location.reload();
      //$location.path('/educator/courseMap');
    } 

  }



})();
