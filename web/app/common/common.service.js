(function() {

    angular
    .module('app.common', [])
    .factory('commonService', commonService);
	
  
  function commonService() {
	  

    var ref = firebase.database().ref();
	// create an instance of the authentication service

	var service = {
      firebaseRef: firebaseRef
    };
	
	return service;

    function firebaseRef() {
      return ref;
    }
  
  }

})();