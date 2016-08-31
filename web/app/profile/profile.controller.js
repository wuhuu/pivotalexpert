(function() {

  angular
    .module('app.profile')
	.controller('ProfileController', ProfileController);

  ProfileController.$inject = ['$scope', '$routeParams', '$firebaseArray', 'authService', '$location', 'navBarService', '$firebaseObject', 'commonService'];
  function ProfileController($scope, $routeParams, $firebaseArray, authService, $location, navBarService, $firebaseObject, commonService) {
		console.log("ProfileController");
		$scope.list =[];
		

		var user = authService.fetchAuthData();
		var ref = commonService.firebaseRef();

		var profileRef = $firebaseObject(ref.child("/auth/usedLinks/"+$routeParams.displayName));
		profileRef.$loaded().then(function(){
			var profile = $firebaseObject(ref.child('/auth/users/'+profileRef.$value));  
			profile.$loaded().then(function (){
				$scope.displayName = profile.displayName;
				getUserAchievements(profile.$id);
				
				if(profile.$id == user.$id) {
					$scope.displayPencil = true;
				}else {
					$scope.displayPencil = false;
				}
								
			});
		});
		
		$scope.updateDisplayName = function (newName,$firebaseAuth) {
			
			
			var usersRef = ref.child('auth').child('users');
			
			console.log();
			usersRef.child(user.$id).update({displayName:newName},function() {
				$location.path('/profile/'+newName);

			});
			
			var userpic = authService.fetchAuthPic();
			userpic.$loaded().then(function(){
			  $scope.displayPic = userpic.$value;
		    });

		}
		
		// var useremail = authService.fetchAuthEmail();
		// 	useremail.$loaded().then(function(){
		// 	  $scope.email = useremail.$value;
		//     });

		function getUserAchievements(uid) {
			var achieveIdlist = [];

			var courseTitle = $firebaseObject(navBarService.getCourseTitle());
			courseTitle.$loaded().then(function(){
				$scope.courseTitle = courseTitle.$value;
				var courseProgressRef = ref.child('/userProfiles/' + uid + '/courseProgress/');

				courseProgressRef.once('value', function(snapshot) {
				  // The callback function will get called twice, once for "fred" and once for "barney"
				  snapshot.forEach(function(childSnapshot) {
					// key will be "fred" the first time and "barney" the second time
					var key = childSnapshot.key();
					achieveIdlist.push(key);
					// childData will be the actual contents of the child
					//var childData = childSnapshot.val();
					});

					var achievelist =[];
						//Load Content
						var content =  $firebaseObject(ref.child('pivotalExpert').child('content'));
						content.$loaded().then(function(){
							var courseContent = content.course.courseContent;
							console.log("Display Question");
							var achievement = {}; 

							achieveIdlist.forEach(function(achieveId,index){
							var modID = achieveId.charAt(1);
							var qnsID = achieveId.charAt(3);

							var questions = courseContent[modID].questions[qnsID];
							achievelist.push(questions.qnsTitle);
						});	

						$scope.achievelist = achievelist;
						
					});			    
				});
			});
	  	}

		
	}

})();