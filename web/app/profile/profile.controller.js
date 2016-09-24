(function() {

  angular
    .module('app.profile')
	.controller('ProfileController', ProfileController);

  function ProfileController($scope, $routeParams, $firebaseArray, $location, navBarService, $firebaseObject, $q) {
    console.log("ProfileController");
    $scope.list =[];
    
    var user = firebase.auth().currentUser;
    var ref = firebase.database().ref();

    var profileRef = $firebaseObject(ref.child("/auth/usedLinks/"+$routeParams.displayName));
    profileRef.$loaded().then(function(){
        var profile = $firebaseObject(ref.child('/auth/users/'+profileRef.$value));
        profile.$loaded().then(function (){
            $scope.displayName = profile.displayName;
            getUserAchievements(profile.$id).then(function(results) {
                $scope.achievelist = results;
            });
           
            if(profile.$id == user.uid) {
                $scope.displayPencil = true;
            }else {
                $scope.displayPencil = false;
            }
                            
        });
    });
    
    $scope.displayPic = user.photoURL;

    function getUserAchievements(uid) {
        var deferred = $q.defer();
        var achievedlist = [];
        var achievements = [];
        
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
                        
                        if(achievedlist.indexOf(course.qns[j].qid) == -1){
                            course.qns.splice(j, 1);
                        }
                    }
                    
                    if(course.qns.length > 0) {
                        achievements.push(course);
                    }
                }
              }
              deferred.resolve(achievements);
            })
        });
        return deferred.promise;
    }
  }

})();