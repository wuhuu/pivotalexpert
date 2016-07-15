(function() {
	
  angular
    .module('app.profile', [])
    .config(configFunction)
	.controller('ProfileController', ProfileController);
  
  configFunction.$inject = ['$routeProvider'];
  
  function configFunction($routeProvider) {
    $routeProvider.
	  when('/profile/:profileId', {
        templateUrl: 'app/profile/profile.html',
		controller: ProfileController
      });
  }
  
  ProfileController.$inject = ['$scope', '$routeParams', '$firebaseArray', 'profileService', 'achieveService'];

  function ProfileController($scope, $routeParams, $firebaseArray, profileService, achieveService) {
	
	$scope.profileId = $routeParams.profileId;
	console.log("Profile for :", $routeParams.profileId);
	
	profileService.fetchPivotalExpertProfile($scope.profileId);
	$scope.achievements = achieveService.fetchAchievements();
	$scope.achievements.$loaded().then(function () {
       $scope.totalAchievements = 0;
       for (var i=0; i<$scope.achievements.length; i++) {
         //Count the achievement if completed
         if ($scope.achievements[i].$value) {
           $scope.totalAchievements += 1;
         }
       }
	});
	
  };
  
})();