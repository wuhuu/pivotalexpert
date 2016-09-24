(function() {

    angular
    .module('app.common', [])
    .factory('commonService', commonService);
	
  
  function commonService() {
	  

    var ref = firebase.database().ref();
	// create an instance of the authentication service

	var service = {
      firebaseRef: firebaseRef,
      guid:guid
    };
	
	return service;

    function firebaseRef() {
      return ref;
    }

    function guid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      }
      return s4() + s4() + s4();
    }
  
  }

})();