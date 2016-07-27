(function() {

  angular
    .module('app.profile')
    .factory('profileService', profileService);

  profileService.$inject = ['$firebaseArray', '$firebaseObject'];
  
  function profileService($firebaseArray, $firebaseObject) {
	
	
	var service = {
      fetchPivotalExpertProfile: fetchPivotalExpertProfile
    };
	
	return service;
	
	//Different function of the auth service
	
	function fetchPivotalExpertProfile(){
		console.log("Fetching publicId Service");
	}

  }

})();