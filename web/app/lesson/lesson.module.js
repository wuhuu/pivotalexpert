(function() {

  angular
    .module('app.lesson', [])
    .config(configFunction);
  
  function configFunction($routeProvider) {
    $routeProvider.
	when('/lesson/mcq/:chapter/:qns/:qid', {
      templateUrl: 'app/lesson/mcq.html',
	  controller: 'LessonController'
    }).
	when('/lesson/slides/:chapter/:qns/:qid', {
      templateUrl: 'app/lesson/slides.html',
	  controller: 'LessonController'
    }).
	when('/lesson/video/:chapter/:qns/:qid', {
      templateUrl: 'app/lesson/video.html',
	  controller: 'LessonController'
    }).
	when('/lesson/LSheet/:chapter/:qns/:qid', {
      templateUrl: 'app/lesson/spreadsheet.html',
	  controller: 'LessonController'
    }).
  when('/lesson/GSheet/:chapter/:qns/:qid', {
      templateUrl: 'app/lesson/gsheet.html',
    controller: 'LessonController'
    });
  }
  
})();