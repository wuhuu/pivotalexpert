(function() { 

  angular
    .module('app', [
      // Angular modules.
      'ngRoute', 'ngMdIcons', 'ngMessages', 
      'ngMaterial',

      // Firebase modules.
      'firebase',

      // Custom modules.
      'app.common',
      'app.layout',
	  'app.landing',
	  'app.auth',
	  'app.profile',
	  'app.lesson',
	  'app.coursemap',
      'app.contentMgmt'

    ])
    .config(configFunction);
    
    
  function configFunction($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('');
	$routeProvider.otherwise({
      redirectTo: '/'
    });
  }
  

})();
