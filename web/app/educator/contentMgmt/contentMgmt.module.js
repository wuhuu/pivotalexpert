(function() {

  angular
    .module('app.contentMgmt', [])
    .config(configFunction);
  
  configFunction.$inject = ['$routeProvider'];
  
  function configFunction($routeProvider) {
    $routeProvider.
	when('/educator/courseMap', {
      templateUrl: 'app/educator/contentMgmt/courseMap_edit.html',
	     controller: 'CourseMapController'
    })
    .when('/educator/slides_edit/:cid/:qid', {
      templateUrl: 'app/educator/contentMgmt/slides_edit.html',
	     controller: 'ContentMgmtController'
    })
    .when('/educator/video_edit/:cid/:qid', {
      templateUrl: 'app/educator/contentMgmt/video_edit.html',
	     controller: 'ContentMgmtController'
    })
    .when('/educator/mcq_edit/:cid/:qid', {
      templateUrl: 'app/educator/contentMgmt/mcq_edit.html',
	     controller: 'ContentMgmtController'
    })
    .when('/educator/excel_edit/:cid/:qid', {
      templateUrl: 'app/educator/contentMgmt/excel_edit.html',
	     controller: 'ContentMgmtController'
    });
  }
  
})();

