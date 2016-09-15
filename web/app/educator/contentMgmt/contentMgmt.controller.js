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
    });

  function ContentMgmtController($http,$scope, $routeParams, $location, $firebaseObject,contentMgmtService) {
	  console.log("ContentMgmtController");
    var qid = $routeParams.qid;
    $scope.qid = qid;
    var question = contentMgmtService.getQuestion(qid);
    question.$loaded().then(function() {
      question.qid = question.$id;
      question.cid = $routeParams.cid;
      $scope.qns = question;
      //$scope.qnsLink = $scope.qns.link;
    })
    .catch(function(error) {
      console.error("Error:", error);
    });

    $scope.saveQns = function() {
      contentMgmtService.updateQuestion($scope.qns,false);
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

