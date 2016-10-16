(function() {

  angular
    .module('app.coursemap', [])
    .config(configFunction);
  
  function configFunction($routeProvider) {
    $routeProvider.
	  when('/course', {
        templateUrl: 'app/coursemap/coursemap.html',
		controller : 'CoursemapController'
      });
  }

})();