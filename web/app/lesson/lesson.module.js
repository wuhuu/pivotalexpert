(function() {
  'use strict';

  angular
    .module('app.lesson', [])
    .config(configFunction);
  
  configFunction.$inject = ['$routeProvider'];
  
  function configFunction($routeProvider) {
    $routeProvider.
	when('/lesson/mcq/:modID/:qnsID', {
      template:
		'<mv-lesson-mcq></mv-lesson-mcq>'
    }).
	when('/lesson/Slides/:modID/:qnsID', {
      template:
		'<mv-lesson-slides></mv-lesson-slides>',
    }).
	when('/lesson/video/:modID/:qnsID', {
      template:
		'<mv-lesson-video></mv-lesson-video>',
    }).
	when('/lesson/LSheet/:modID/:qnsID', {
      template:
		'<mv-lesson-spreadsheet></mv-lesson-spreadsheet>',
    });
  }
  
})();