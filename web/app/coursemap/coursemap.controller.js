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

  function CoursemapController($scope, $firebaseArray,$timeout) {
    console.log("Coursemap Page");
	var user = firebase.auth().currentUser;
	var ref = firebase.database().ref();
	var list = [];
	firebase.auth().onAuthStateChanged((user) => {
      if (user == null) {
          // TODO: start sign-in flow
      }
      else {
          // TODO: start actual work
        var courseProgressRef = ref.child('/userProfiles/' + user.uid + '/courseProgress/');
        courseProgressRef.once('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var key = childSnapshot.key;

                        var modID = key.charAt(1);
                        var qnsID = key.charAt(3);
                        var qid = 'q' + ((modID * 5 + 1) + (qnsID * 1));
                        
                list.push(qid);
            });

            // Retrieve from sequence
            var courseSequence =  $firebaseArray(ref.child('courseSequence'));
            courseSequence.$loaded().then(function(){
                $scope.courseMaterial = courseSequence;
            });
        });
      }
    });	

		$scope.complete = function (qnsId) {
			return list.indexOf(qnsId) > -1;    
		};
  }

})();