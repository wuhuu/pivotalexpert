(function() {

  angular
    .module('app.lesson', [])
    .config(configFunction);

  function configFunction($routeProvider) {
    $routeProvider.
	when('/lesson/mcq/:bid/:chapter/:qns/:qid', {
      templateUrl: 'app/lesson/mcq.html',
	  controller: 'LessonController'
    })
    .when('/lesson/slides/:bid/:chapter/:qns/:qid', {
      templateUrl: 'app/lesson/slides.html',
	  controller: 'LessonController'
    })
	.when('/lesson/video/:bid/:chapter/:qns/:qid', {
      templateUrl: 'app/lesson/video.html',
	  controller: 'LessonController'
    })
	.when('/lesson/excel/:bid/:chapter/:qns/:qid', {
      templateUrl: 'app/lesson/spreadsheet.html',
	  controller: 'LessonController'
    })
    .when('/lesson/code/:bid/:chapter/:qns/:qid', {
      templateUrl: 'app/lesson/codebox.html',
    controller: 'LessonController'
    })
    .when('/lesson/form/:bid/:chapter/:qns/:qid', {
      templateUrl: 'app/lesson/form.html',
    controller: 'LessonController'
    })
    .when('/lesson/iframe/:bid/:chapter/:qns/:qid', {
      templateUrl: 'app/lesson/iframe.html',
    controller: 'LessonController'
    });
  }

})();
