(function() {

  angular
    .module('app.profile')
	.controller('ProfileController', ProfileController);

  ProfileController.$inject = ['$scope', '$routeParams', '$firebaseArray','authService','$location','navBarService','$firebaseObject'];

  function ProfileController($scope, $routeParams, $firebaseArray,authService,$location,navBarService,$firebaseObject) {
		$scope.list =[];
		$scope.displayName = $routeParams.displayName;
		var user = authService.fetchAuthData();
		var ref = new Firebase("https://pivotal-expert.firebaseio.com");

		$scope.updateDisplayName = function (newName,$firebaseAuth) {
			console.log("updating");
			
			var usersRef = ref.child('auth').child('users');
			
			console.log();
			usersRef.child(user.$id).update({displayName:newName},function() {
				navBarService.updateNavBar($scope,newName);
				$location.path('/profile/'+newName);

			});
			
			
			//window.location.reload();

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
			var list = [];

			var courseProgressRef = new Firebase('https://pivotal-expert.firebaseio.com/pivotalExpert/PEProfile/'
				+uid+'/courseProgress/');

			courseProgressRef.once('value', function(snapshot) {
			  // The callback function will get called twice, once for "fred" and once for "barney"
			  snapshot.forEach(function(childSnapshot) {
			    // key will be "fred" the first time and "barney" the second time
			    var key = childSnapshot.key();
			    list.push(key);
			    // childData will be the actual contents of the child
			    //var childData = childSnapshot.val();
				});
			  
			  $scope.$apply(function(){
			  	$scope.list = list;
			  });
			});
	  	}

	  	user.$loaded().then(function(){
	  		getUserAchievements(user.$id);
	  	});
		
	}

})();