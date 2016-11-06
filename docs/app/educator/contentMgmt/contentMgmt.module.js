(function() {

  angular
    .module('app.contentMgmt', [])
    .config(configFunction);

  function configFunction($routeProvider) {
    $routeProvider.
  // for editing
	when('/educator/bookMap/:bid', {
      templateUrl: 'app/educator/contentMgmt/courseMap_edit.html',
	     controller: 'CourseMapController'
    })
    .when('/educator/courseLibrary', {
      templateUrl: 'app/educator/contentMgmt/books_edit.html',
	     controller: 'BookController'
    })
    .when('/educator/slides_edit/:bid/:cid/:qid', {
      templateUrl: 'app/educator/contentMgmt/slides_edit.html',
	     controller: 'ContentMgmtController'
    })
    .when('/educator/video_edit/:bid/:cid/:qid', {
      templateUrl: 'app/educator/contentMgmt/video_edit.html',
	     controller: 'ContentMgmtController'
    })
    .when('/educator/mcq_edit/:bid/:cid/:qid', {
      templateUrl: 'app/educator/contentMgmt/mcq_edit.html',
	     controller: 'ContentMgmtController'
    })
    .when('/educator/excel_edit/:bid/:cid/:qid', {
      templateUrl: 'app/educator/contentMgmt/excel_edit.html',
	     controller: 'ContentMgmtController'
    })
    .when('/educator/code_edit/:bid/:cid/:qid', {
      templateUrl: 'app/educator/contentMgmt/code_edit.html',
	     controller: 'ContentMgmtController'
    })
    .when('/educator/form_edit/:bid/:cid/:qid', {
      templateUrl: 'app/educator/contentMgmt/form_edit.html',
	     controller: 'ContentMgmtController'
    })
    .when('/educator/iframe_edit/:bid/:cid/:qid', {
      templateUrl: 'app/educator/contentMgmt/iframe_edit.html',
	     controller: 'ContentMgmtController'
    })
    // for creation
    .when('/educator/video_create/:bid/:cid', {
      templateUrl: 'app/educator/contentMgmt/video_edit.html',
	     controller: 'ContentMgmtController'
    })
    .when('/educator/slides_create/:bid/:cid', {
      templateUrl: 'app/educator/contentMgmt/slides_edit.html',
	     controller: 'ContentMgmtController'
    })
    .when('/educator/mcq_create/:bid/:cid', {
      templateUrl: 'app/educator/contentMgmt/mcq_edit.html',
	     controller: 'ContentMgmtController'
    })
    .when('/educator/spreadsheet_create/:bid/:cid', {
      templateUrl: 'app/educator/contentMgmt/excel_edit.html',
	     controller: 'ContentMgmtController'
    })
    .when('/educator/codebox_create/:bid/:cid', {
      templateUrl: 'app/educator/contentMgmt/code_edit.html',
	     controller: 'ContentMgmtController'
    })
    .when('/educator/google_form_create/:bid/:cid', {
      templateUrl: 'app/educator/contentMgmt/form_edit.html',
	     controller: 'ContentMgmtController'
    })
    .when('/educator/iframe_create/:bid/:cid', {
      templateUrl: 'app/educator/contentMgmt/iframe_edit.html',
	     controller: 'ContentMgmtController'
    });
  }

})();
