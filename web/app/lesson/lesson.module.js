(function() {

  angular
    .module('app.lesson', [])
    .config(configFunction);
  
  configFunction.$inject = ['$routeProvider'];
  
  function configFunction($routeProvider) {
    $routeProvider.
	when('/lesson/mcq/:modID/:qnsID', {
      templateUrl: 'app/lesson/mcq.html',
	  controller: 'LessonController'
    }).
	when('/lesson/Slides/:modID/:qnsID', {
      templateUrl: 'app/lesson/slides.html',
	  controller: 'LessonController'
    }).
	when('/lesson/video/:modID/:qnsID', {
      templateUrl: 'app/lesson/video.html',
	  controller: 'LessonController'
    }).
	when('/lesson/LSheet/:modID/:qnsID', {
      templateUrl: 'app/lesson/spreadsheet.html',
	  controller: 'LessonController'
    });
  }
  
})();