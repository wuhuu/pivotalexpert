(function() {

  angular
    .module('app.landing', [])
    .config(configFunction);
  
  configFunction.$inject = ['$routeProvider'];
  
  function configFunction($routeProvider) {
    $routeProvider.
	  when('/', {
        templateUrl: 'app/landing/blank.html',
	    controller: 'LandingController'
      });
  }

})();