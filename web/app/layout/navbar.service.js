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