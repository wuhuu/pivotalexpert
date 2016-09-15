(function() {

  angular
    .module('app.landing')
    .controller('LandingController', LandingController);

  LandingController.$inject = ['$scope','$http','$firebaseObject','$location','authService'];

  function LandingController($scope, $http, $firebaseObject,$location ,authService) {
	  console.log("LandingController");
	  
	  var ref = firebase.database().ref();
	  var user = firebase.auth().currentUser;
      
	  var lastAttempt = $firebaseObject(ref.child('userProfiles').child(user.uid).child('lastAttempt'));
      
	  lastAttempt.$loaded(function(){
		if(lastAttempt.$value == 'completed') {
			var profileLink= $firebaseObject(ref.child('auth/user').child(user.uid).child('profileLink'));;
			profileLink.$loaded().then(function(){
				$location.path('/profile/' + profileLink.$value);
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