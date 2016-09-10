(function() {

  angular
    .module('app.contentMgmt', [])
    .config(configFunction);
  
  configFunction.$inject = ['$routeProvider'];
  
  function configFunction($routeProvider) {
    $routeProvider.
	when('/educator/chapter', {
      templateUrl: 'app/educator/contentMgmt/chapter.html',
	     controller: 'ContentMgmtController'
    });
  }
  
})();

