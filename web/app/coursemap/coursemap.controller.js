(function() {

  angular
    .module('app.coursemap')
    .controller('CoursemapController', CoursemapController);

  function CoursemapController($scope, $firebaseArray) {
    console.log("Coursemap Page");
	var user = firebase.auth().currentUser;
	var ref = firebase.database().ref();
	
	var courseProgressRef = ref.child('/userProfiles/' + user.uid + '/courseProgress/');
	var list = [];
	courseProgressRef.once('value', function(snapshot) {
	  snapshot.forEach(function(childSnapshot) {
		var key = childSnapshot.key;

        var modID = key.charAt(1);
        var qnsID = key.charAt(3);
        var qid = 'q' + ((modID * 5 + 1) + (qnsID * 1));
        
		list.push(qid);
	  });

		$scope.complete = function (qnsId) {
			return list.indexOf(qnsId) > -1;
            
		};
        // Retrieve from sequence
		var courseSequence =  $firebaseArray(ref.child('courseSequence'));
		courseSequence.$loaded().then(function(){
			$scope.courseMaterial = courseSequence;
		});
        
        

	});

  }

})();