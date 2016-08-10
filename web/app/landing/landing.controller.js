(function() {

  angular
    .module('app.landing')
    .controller('LandingController', LandingController);

  LandingController.$inject = ['$scope','$http','$firebaseObject','$location','authService', 'commonService'];

  function LandingController($scope, $http, $firebaseObject,$location ,authService, commonService) {
	  console.log("LandingController");
	  
	  var ref = commonService.firebaseRef();
	  var user = authService.fetchAuthData();
	  var lastAttempt = $firebaseObject(ref.child('userProfiles').child(user.$id).child('Pivotal-Expert/lastAttempt'));
	  lastAttempt.$loaded(function(){
		if(lastAttempt.$value == 'completed') {
			var username = authService.fetchAuthUsername();
		 	username.$loaded().then(function(){
				$location.path('/profile/' + username.$value);
			});
			return;
		}
		var modID = lastAttempt.$value.charAt(1);
	    var qnsID = lastAttempt.$value.charAt(3);
	  
		//Load Content
		var content =  $firebaseObject(ref.child('pivotalExpert').child('content'));
		content.$loaded().then(function(){
			var courseContent = content.course.courseContent;
			var questions = courseContent[modID].questions[qnsID];
			
			$location.path('/lesson/' + questions.qnsType + '/' + modID + '/' + qnsID);
		});
	});
  }

})();