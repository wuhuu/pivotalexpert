(function() {

  angular
    .module('app.analytics', [])
    .config(configFunction);

  function configFunction($routeProvider) {
    $routeProvider.
  // for editing
	when('/educator/analytics', {
      templateUrl: 'app/educator/analytics/dashboard.html',
	     controller: 'AnalyticsController'
    })
    .when('/educator/analytics/bid/stats', {
      templateUrl: 'app/educator/analytics/bookStats.html',
	     controller: 'AnalyticsController'
    });
  }

})();
