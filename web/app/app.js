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
    
  // Initialize Firebase
  var config = {      
    apiKey: "AIzaSyDt22-VriobDs7cNfkmY8yxHur9IQBewWo",
    authDomain: "pivotal-expert.firebaseapp.com",
    databaseURL: "https://pivotal-expert.firebaseio.com",
    storageBucket: "",
  };
  firebase.initializeApp(config);
    
  function configFunction($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('');
	$routeProvider.otherwise({
      redirectTo: '/'
    });
  }
  

})();
