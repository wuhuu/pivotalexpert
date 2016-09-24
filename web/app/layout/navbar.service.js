(function() {

  angular
    .module('app.layout')
    .factory('navBarService', navBarService);


  function navBarService($rootScope, $firebaseObject, $firebaseAuth, $firebaseArray, authService) {
    var ref = firebase.database().ref();
    

    var service = {
      updateNavBar: updateNavBar,
      getUserAchievements: getUserAchievements,
      getCourseTitle: getCourseTitle
    };

    return service;

    function updateNavBar($scope,displayName) {
      $scope.displayName = displayName;
      var user = firebase.auth().currentUser;
      getUserAchievements($scope, user.uid);
    }
    
    function getUserAchievements($scope, uid) {
                  
        var achievedlist = [];
        var achievements = 0;
        var currentUser = firebase.auth().currentUser;
        
        var courseList = $firebaseArray(ref.child('/courseSequence'));
        courseList.$loaded().then(function (){
            var courseProgressRef = ref.child('/userProfiles/' + uid + '/courseProgress/');
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
                $rootScope.ownNumAchievement = achievements;
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