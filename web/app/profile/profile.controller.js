(function() {

  angular
    .module('app.profile')
	.controller('ProfileController', ProfileController);

  ProfileController.$inject = ['$http','$scope', '$routeParams', '$firebaseArray','authService','$location','navBarService','$firebaseObject'];

  function ProfileController($http,$scope, $routeParams, $firebaseArray,authService,$location,navBarService,$firebaseObject) {
		$scope.list =[];
		$scope.displayName = $routeParams.displayName;
		var user = authService.fetchAuthData();
		var ref = new Firebase("https://pivotal-expert.firebaseio.com");

		$scope.updateDisplayName = function (newName,$firebaseAuth) {
			console.log("updating");
			
			var usersRef = ref.child('auth').child('users');
			
			console.log();
			usersRef.child(user.$id).update({displayName:newName},function() {
				//navBarService.updateNavBar($scope,newName);
				$location.path('/profile/'+newName);

			});
			
			var userpic = authService.fetchAuthPic();
			userpic.$loaded().then(function(){
			  $scope.displayPic = userpic.$value;
		    });

		}

		var useremail = authService.fetchAuthEmail();
			useremail.$loaded().then(function(){
			  $scope.email = useremail.$value;
		    });

		function getUserAchievements(uid) {
			var achieveIdlist = [];

			var courseProgressRef = new Firebase('https://pivotal-expert.firebaseio.com/userProfiles/'
				+uid+'/courseProgress/');

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
				$http.get('course/content.json').success(function(data) {
					console.log("Display Question");
					var achievement = {}; 
					var courseContent = data.course.courseContent;

					achieveIdlist.forEach(function(achieveId,index){
						var modID = achieveId.charAt(1);
						var qnsID = achieveId.charAt(3);

						var questions = courseContent[modID].questions[qnsID];
						achievelist.push(questions.qnsTitle);
					});	

					$scope.achievelist = achievelist;
					
				});			    
			});
	  	}

	  	user.$loaded().then(function(){
	  		getUserAchievements(user.$id);
	  	});
		
	}

})();