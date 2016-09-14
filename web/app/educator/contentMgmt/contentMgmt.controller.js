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
                        axis: "y",
                        handle: "md-item",
                        stop: function( event, ui ) {
                          // IE doesn't register the blur when sorting
                          // so trigger focusout handlers to remove .ui-state-focus
                          ui.item.children( "h4" ).triggerHandler( "focusout" );
                          // Refresh accordion to handle new order
                          $( this ).accordion( "refresh" );
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
  }

  

})();

