(function() {

  angular
    .module('app.layout')
    .factory('navBarService', navBarService);


  function navBarService($rootScope, $firebaseObject, $firebaseArray, authService, $q) {
    var ref = firebase.database().ref();
    var adminRef = ref.child('auth/admin');

    var service = {
      updateNavBar: updateNavBar,
      getCourseTitle: getCourseTitle
    };

    return service;

    function updateNavBar() {
        updateAchievementCount().then(function(result){
            $rootScope.ownNumAchievement = result;
        });
        //Check whether login is an admin or sub-admin
        var userData = firebase.auth().currentUser;
        console.log(userData);
        adminRef.once('value', function(snapshot) {
          if(snapshot.child('admin').val()) { 
            if(snapshot.child('admin').val() === userData.uid) {
                //check whether login user is main admin
                $rootScope.mainAdmin = true;
            }
          }
          if(snapshot.child('subAdmins').val()) {
            var subadmins = snapshot.child('subAdmins').val();
            for (var subadmin in subadmins) {
               if(subadmin == userData.uid) {
                    $rootScope.isAdmin = true;
                }
            }
          }
        });
        
    }
    
    function updateAchievementCount() {
        var deferred = $q.defer();
        var user = firebase.auth().currentUser;
        var achievedlist = [];
        var achievements = 0;
        var bookList = $firebaseArray(ref.child('/library'));
        bookList.$loaded().then(function (){
            
            user = firebase.auth().currentUser;
            var courseProgressRef = ref.child('/userProfiles/' + user.uid + '/courseProgress/');
            courseProgressRef.once('value', function(snapshot) {
              snapshot.forEach(function(childSnapshot) {
                var key = childSnapshot.key;
                achievedlist.push(key);
              });
              var totalBook = bookList.length;
              
              for (i = 0; i < totalBook; i++) { 
                var book = bookList[i];
                var courseList = book.sequence;
                if(courseList){
                    var totalCourse = courseList.length;
                    for (j = 0; j < totalCourse; j++) { 
                      var chapter = courseList[j];
                      if(chapter.qns) {
                          var qnsCount = chapter.qns.length;
                          for (k = 0; k < qnsCount; k++) { 
                              if(achievedlist.indexOf(chapter.qns[k].qid) != -1){
                                  achievements++;
                              }
                          }
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