(function() {

  angular
    .module('app.layout')
    .factory('navBarService', navBarService);


  function navBarService($rootScope, $firebaseObject, $firebaseAuth, $firebaseArray, authService, commonService) {
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
        var achievedlist = [];
        var achievements = 0;
        var user = firebase.auth().currentUser;
        
        //Check whether login user email belong to admin account email
        var adminEmail = commonService.getAdminEmail().toUpperCase();
        //update admin role
        if(adminEmail.toUpperCase() === user.providerData[0].email) {
            $rootScope.isAdmin = true;
        }
        
        var courseList = $firebaseArray(ref.child('/courseSequence'));
        courseList.$loaded().then(function (){
            var courseProgressRef = ref.child('/userProfiles/' + user.uid + '/courseProgress/');
            courseProgressRef.once('value', function(snapshot) {
              snapshot.forEach(function(childSnapshot) {
                var key = childSnapshot.key;
                achievedlist.push(key);
              });
            
              var totalCourse = courseList.length;
              for (i = 0; i < totalCourse; i++) { 
                var course = courseList[i];
                if(course.qns) {
                    var qnsCount = course.qns.length;
                    for (j = 0; j < qnsCount; j++) { 
                        if(achievedlist.indexOf(course.qns[j].qid) != -1){
                            achievements++;
                        }
                    }
                }
              }
              $scope.$apply(function(){
                $rootScope.numAchievement = achievements;
              });
            })
        });

    }

    function getCourseTitle() {

        var courseTitleRef = ref.child('/courseSetting/courseName');
        return courseTitleRef;
    }
  }

})();