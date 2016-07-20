(function() {
  'use strict';

  angular
    .module('app.lesson', [])
    .config(configFunction);
  
  configFunction.$inject = ['$routeProvider'];
  
  function configFunction($routeProvider) {
    $routeProvider.
	when('/lesson1', {
      template:
		'<mv-lesson-mcq></mv-lesson-mcq>',
    }).
	when('/lesson2', {
      template:
		'<mv-lesson-slides></mv-lesson-slides>',
    }).
	when('/lesson3', {
      template:
		'<mv-lesson-video></mv-lesson-video>',
    }).
	when('/lesson4', {
      template:
		'<mv-lesson-spreadsheet></mv-lesson-spreadsheet>',
    });
  }
  
})();