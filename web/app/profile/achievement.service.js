(function() {

  angular
    .module('app.profile')
    .factory('achieveService', achieveService);

  achieveService.$inject = ['$firebaseArray', '$firebaseObject'];
  
  function achieveService($firebaseArray, $firebaseObject) {

	var ref = new Firebase("https://pivotal-expert.firebaseio.com");
	
	var service = {
      fetchAchievements: fetchAchievements
    };
	
	return service;
	
	//Different function of the auth service
	
	function fetchAchievements(profileId){
		
		return $firebaseArray(ref.child('pivotalExpert/userProfiles/' + profileId + '/userAchievements'));
	}

  }

})();