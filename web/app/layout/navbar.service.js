(function() {

  angular
    .module('app.layout')
    .factory('navBarService', navBarService);


  function navBarService($rootScope, $firebaseObject, $firebaseArray, authService, commonService, $q) {
    var ref = firebase.database().ref();
    

    var service = {
      updateNavBar: updateNavBar,
      getCourseTitle: getCourseTitle
    };

    return service;

    function updateNavBar() {
        updateAchievementCount().then(function(result){
            $rootScope.ownNumAchievement = result;
        })      
        
    }
    
    function updateAchievementCount() {
        var deferred = $q.defer();
        var user = firebase.auth().currentUser;
        var achievedlist = [];
        var achievements = 0;
        var courseList = $firebaseArray(ref.child('/courseSequence'));
        courseList.$loaded().then(function (){
            user = firebase.auth().currentUser;
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
              deferred.resolve(achievements);
            });
        });
        return deferred.promise;
    }
    
    function getCourseTitle() {
        var courseTitleRef = ref.child('/courseSetting/courseName');
        return courseTitleRef;
    }
  }

})();