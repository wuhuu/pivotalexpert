(function() {

  angular
    .module('app.landing')
    .controller('LandingController', LandingController);

  LandingController.$inject = ['$scope','$http','$firebaseObject','$location','authService'];

  function LandingController($scope, $http, $firebaseObject,$location ,authService) {
	  console.log("LandingController");
	  
	  var ref = new Firebase("https://pivotal-expert.firebaseio.com");
	  var user = authService.fetchAuthData();
	  var lastAttempt = $firebaseObject(ref.child('userProfiles').child(user.$id).child('lastAttempt'));
	  lastAttempt.$loaded(function(){
		if(lastAttempt.$value == 'completed') {
			console.log("Testing");
			var username = authService.fetchAuthUsername();
		 	username.$loaded().then(function(){
				$location.path('/profile/' + username.$value);
			});
			return;
		}
		var modID = lastAttempt.$value.charAt(1);
	    var qnsID = lastAttempt.$value.charAt(3);
	  
		$http.get('course/content.json').success(function(data) {
			var courseContent = data.course.courseContent;
			var questions = courseContent[modID].questions[qnsID];
			
			$location.path('/lesson/' + questions.qnsType + '/' + modID + '/' + qnsID);
		});
	});
  }

})();