(function() {

  angular
    .module('app.layout')
    .factory('navBarService', navBarService);


  function navBarService($rootScope, $firebaseObject, $firebaseAuth, authService) {
    var ref = firebase.database().ref();
    

    var service = {
      updateNavBar: updateNavBar,
      getUserAchievements: getUserAchievements,
      getCourseTitle: getCourseTitle
    };

    return service;

    function updateNavBar($scope,displayName) {
      $scope.displayName = displayName;
      getUserAchievements($scope);
    }

    function getUserAchievements($scope) {
        var courseTitle = $firebaseObject(getCourseTitle());
        courseTitle.$loaded().then(function(){
            courseTitle = courseTitle.$value;
            var user = firebase.auth().currentUser;
            var courseProgressRef = ref.child('/userProfiles/' + user.uid + '/courseProgress/');

            courseProgressRef.once('value', function(snapshot) {
              // The callback function will get called twice, once for "fred" and once for "barney"
              
              $scope.$apply(function(){
                $rootScope.numAchievement = snapshot.numChildren();
              });
            });
        });
    }
    
    function getCourseTitle() {

        var courseTitleRef = ref.child('/courseSetting/courseName');
        return courseTitleRef;
    }
  }

})();