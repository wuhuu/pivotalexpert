(function() {

  angular
    .module('app.profile')
    .factory('achieveService', achieveService);

  achieveService.$inject = ['$firebaseArray', '$firebaseObject', ' commonService'];
  
  function achieveService($firebaseArray, $firebaseObject, commonService) {

	var ref = commonService.firebaseRef();;
	
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