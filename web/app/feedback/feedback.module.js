(function() {

  angular
    .module('app.feedback', [])
    .config(configFunction);
  
  function configFunction($routeProvider) {
    $routeProvider.
	  when('/feedback', {
        templateUrl: 'app/feedback/feedback.html',
	    controller: 'FeedbackController'
      });
  }

})();