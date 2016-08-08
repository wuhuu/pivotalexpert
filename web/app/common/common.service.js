(function() {

    angular
    .module('app.common', [])
    .factory('commonService', commonService);
	
  commonService.$inject = [];
  
  function commonService() {
	  
	// create an instance of the authentication service
	var ref = new Firebase("https://pivotal-expert.firebaseio.com");

	var service = {
      firebaseRef: firebaseRef
    };
	
	return service;

    function firebaseRef() {
      return ref;
    }
  
  }

})();