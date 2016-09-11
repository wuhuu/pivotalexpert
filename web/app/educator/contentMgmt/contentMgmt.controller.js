(function() {

  angular
    .module('app.contentMgmt')
    .controller('ContentMgmtController', ContentMgmtController)
    .controller('CourseMapController',CourseMapController);

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

