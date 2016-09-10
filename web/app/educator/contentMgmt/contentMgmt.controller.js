(function() {

  angular
    .module('app.contentMgmt')
    .controller('ContentMgmtController', ContentMgmtController);

  ContentMgmtController.$inject = ['$http','$scope', '$routeParams', '$location', '$firebaseObject', 'authService', 'commonService'];

  function ContentMgmtController($http,$scope, $routeParams, $location, $firebaseObject, authService, commonService) {
	  console.log("ContentMgmtController");
    
  }

})();