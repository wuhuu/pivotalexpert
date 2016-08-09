(function() {

  angular
    .module('app.coursemap', [])
    .config(configFunction);
  
  configFunction.$inject = ['$routeProvider'];
  
  function configFunction($routeProvider) {
    $routeProvider.
	  when('/course', {
        templateUrl: 'app/coursemap/coursemap.html',
		controller : 'CoursemapController'
      });
  }

})();