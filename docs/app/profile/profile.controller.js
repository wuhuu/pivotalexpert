(function() {

  angular
    .module('app.profile')
	.controller('ProfileController', ProfileController);

  function ProfileController($scope, $routeParams, $firebaseArray, $location, $sce, navBarService, $firebaseObject, $q) {
    console.log("ProfileController");
    $scope.list =[];

    var ref = firebase.database().ref();
    var user = firebase.auth().currentUser;

    var profileRef = $firebaseObject(ref.child("/auth/usedLinks/"+$routeParams.displayName));
    profileRef.$loaded().then(function(){
        var profile = $firebaseObject(ref.child('/auth/users/'+profileRef.$value));
        profile.$loaded().then(function (){
            $scope.displayName = profile.displayName;
            getUserAchievements(profile.$id);
            if(user && profile.$id == user.uid) {
                $scope.displayPencil = true;
            }else {
                $scope.displayPencil = false;
            }
            testImage(profile.pic).then(
                function fulfilled(img) {
                      $scope.displayPic = $sce.trustAsUrl(profile.pic);
                },

                function rejected() {
                      $scope.displayPic = $sce.trustAsUrl("../content/images/photo.jpg");
                }

            );
        });
    });

    function getUserAchievements(uid) {
        var achievedlist = [];
        var achievements = [];
        var achievementsNum = 0;

        var bookList = $firebaseArray(ref.child('/library'));
        bookList.$loaded().then(function (){

            var courseProgressRef = ref.child('/userProfiles/' + uid + '/courseProgress/');
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
                        var currentPos = 0;

                        for (k = 0; k < qnsCount; k++) {

                            if(chapter.qns[k]) {
                                if(achievedlist.indexOf(chapter.qns[k].qid) == -1){
                                    chapter.qns.splice(currentPos, 1);
                                } else {
                                    achievementsNum++;
                                    currentPos++;

                                }
                            } else {
                                chapter.qns.splice(currentPos, 1);
                            }
                        }
                        if(chapter.qns.length > 0) {
                            achievements.push(chapter);
                        }
                    }
                  }
                }
              }

              $scope.$apply(function() {
                $scope.numAchievement = achievementsNum;
                $scope.achievelist = achievements;
              });
            })
        });
    }
  }

  function testImage(url) {

      // Define the promise
      const imgPromise = new Promise(function(resolve, reject) {

          // Create the image
          const imgElement = new Image();

          // When image is loaded, resolve the promise
          imgElement.addEventListener('load', function imgOnLoad() {
              resolve(this);
          });

          // When there's an error during load, reject the promise
          imgElement.addEventListener('error', function imgOnError() {
              reject();
          })

          // Assign URL
          imgElement.src = url;

      });

      return imgPromise;
  }


})();
