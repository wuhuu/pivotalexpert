(function() {

  angular
    .module('app.administrator', [])
    .config(configFunction);
  
  function configFunction($routeProvider) {
    $routeProvider.
	  when('/educator/administrator', {
        templateUrl: 'app/educator/administrator/administrator.html',
	    controller: 'AdministratorController'
      });
  }

})();