(function() {

  angular
    .module('app.profile')
	.controller('ProfileController', ProfileController);

  function ProfileController($scope, $routeParams, $firebaseArray, $location, navBarService, $firebaseObject) {
		console.log("ProfileController");
		$scope.list =[];
		
		var user = firebase.auth().currentUser;
		var ref = firebase.database().ref();

		var profileRef = $firebaseObject(ref.child("/auth/usedLinks/"+$routeParams.displayName));
		profileRef.$loaded().then(function(){
			var profile = $firebaseObject(ref.child('/auth/users/'+profileRef.$value));
			profile.$loaded().then(function (){
				$scope.displayName = profile.displayName;
				getUserAchievements(profile.$id);
				
				if(profile.$id == user.uid) {
					$scope.displayPencil = true;
				}else {
					$scope.displayPencil = false;
				}
								
			});
		});
        
        $scope.displayPic = user.photoURL;

		function getUserAchievements(uid) {
			var achieveIdlist = [];
			var courseTitle = $firebaseObject(navBarService.getCourseTitle());
			courseTitle.$loaded().then(function(){
				$scope.courseTitle = courseTitle.$value;

				var courseProgressRef = ref.child('/userProfiles/' + uid + '/courseProgress/');
				courseProgressRef.once('value', function(snapshot) {

                  snapshot.forEach(function(childSnapshot) {

                    var key = childSnapshot.key;
                    
                    var modID = key.charAt(1);
                    var qnsID = key.charAt(3);
                    var qid = 'q' + ((modID * 5 + 1) + (qnsID * 1));
                    achieveIdlist.push(qid);
                  });
                   //need to change
					var achievelist =[];

                    console.log("Display Question");

                    achieveIdlist.forEach(function(qid,index){
          
                        var question =  $firebaseObject(ref.child('course/questions/' + qid));
                        question.$loaded().then(function(){

                            achievelist.push(question);

                        });	

					});  
                    
                    $scope.achievelist = achievelist;
				});
			});
	  	}

		
	}

})();