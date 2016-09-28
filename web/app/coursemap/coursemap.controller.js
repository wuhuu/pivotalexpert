(function() {

  angular
    .module('app.coursemap')
    .controller('CoursemapController', CoursemapController)
		.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    $( "#accordion1" )
                      .accordion({
                        header: "> div > h2",
                        collapsible: true,
                        heightStyle: "content"
                      });                     
                });
            }
        }
      }
    });

  function CoursemapController($scope, $firebaseArray,$timeout, $q) {
      
    console.log("Coursemap Page");
    $timeout(loadCourseSequence, 1000);
    
    function loadCourseSequence() {
        var ref = firebase.database().ref();
        var user = firebase.auth().currentUser;
        var achievedlist = [];
        // Retrieve from sequence
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
                var chapter = courseList[i];

                if(chapter.qns) {
                    var qnsCount = chapter.qns.length;

                    for (j = 0; j < qnsCount; j++) { 
                        if(chapter.qns[j]) {
                            if(achievedlist.indexOf(chapter.qns[j].qid) != -1){
                                chapter.qns[j].complete = true;
                            }
                        }
                    }
                }
              }
            })
        });
        $scope.courseMaterial = courseList;
    }
  }
  


})();