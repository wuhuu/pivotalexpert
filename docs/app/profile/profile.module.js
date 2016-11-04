(function() {
	
  angular
    .module('app.profile', [])
    .config(configFunction)
  
  function configFunction($routeProvider) {
    $routeProvider.
	  when('/profile/:displayName', {
        templateUrl: 'app/profile/profile.html',
		controller: 'ProfileController'
      });
  }
  
})();