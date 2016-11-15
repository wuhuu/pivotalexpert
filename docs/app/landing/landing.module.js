(function() {

  angular
    .module('app.landing', [])
    .config(configFunction);

  function configFunction($routeProvider) {
    $routeProvider.
	  when('/', {
        templateUrl: 'app/landing/blank.html',
	       controller: 'LandingController'
      });
  }

})();
