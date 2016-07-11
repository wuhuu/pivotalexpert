(function() { // Wrap in an IIFE

  angular
    .module('app', [
      // Angular modules.
      'ngRoute',

      // Third party modules.
      'firebase',

      // Custom modules.
      'app.auth',
      'app.common',
      'app.landing',
      'app.layout',
	  'app.lesson',
	  'app.profile',

    ])
    .config(configFunction);

  configFunction.$inject = ['$locationProvider', '$routeProvider'];

  function configFunction($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('');
    $routeProvider.
        when('/home', {
              templateUrl: 'app/landing/home.html'
        }).
		when('/users', {
              templateUrl: 'app/partials/users.html',
              controller: 'SampleCtrl'
        }).
        when('/profile/:profileId', {
              templateUrl: 'app/profile/profile.html',
              controller: 'ProfileCtrl'
        }).
        when('/tasks', {
              templateUrl: 'app/partials/tasks.html',
              controller: 'SampleCtrl'
        }).
		when('/lesson', {
              templateUrl: 'app/lesson/lesson.html',
              controller: 'SampleCtrl'
        }).
		when('/login', {
              templateUrl: 'app/auth/login.html',
              controller: 'SampleCtrl'
        }).
        otherwise('/home');
  }

})();
