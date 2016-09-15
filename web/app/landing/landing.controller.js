(function() {

  angular
    .module('app.landing')
    .controller('LandingController', LandingController);

  LandingController.$inject = ['$scope','$firebaseObject','$location'];

  function LandingController($rootScope, $firebaseObject,$location) {
	  console.log("LandingController");
	     
      firebase.auth().onAuthStateChanged(function(user) {
         
        if (user) {
          // User is signed in.
          var usersRef = firebase.database().ref().child('auth/users');
          var userData = $firebaseObject(usersRef.child(user.uid));
          //navBarService.updateNavBar(user.displayName);
          userData.$loaded().then(function(){
               
            $rootScope.logined = true;
            if(userData.profileLink == null) {
              $location.path('/createProfileLink');
            }
            else{
              $location.path('/profile/' + userData.profileLink);
            }
          });
        } else {
          // User not signed in.
          $location.path('/login/');
        }
      });
      
      
      /* OLD CODE
	  var ref = firebase.database().ref();
	  var user = firebase.auth().currentUser;
      
	  var lastAttempt = $firebaseObject(ref.child('userProfiles').child(user.$id).child('lastAttempt'));
      
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
    */
  }

})();