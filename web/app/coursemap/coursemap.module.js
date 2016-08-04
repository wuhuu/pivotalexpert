(function() {

  angular
    .module('app.course', [])
    .config(configFunction);
  
  configFunction.$inject = ['$routeProvider'];
  
  function configFunction($routeProvider) {
    $routeProvider.
	  when('/course', {
        templateUrl: 'app/coursemap/coursemap.html'
      });
  }

})();