(function() {

  angular
    .module('app.feedback')
    .controller('FeedbackController', FeedbackController);

  function FeedbackController($scope, $sce, $firebaseObject) {
        console.log("FeedbackController");
        var ref = firebase.database().ref();
        var settingRef = ref.child('settings');
        var feedbackRef = settingRef.child('feedback');
      
        $scope.addFeedback = function() {
            settingRef.update({"feedback" : $scope.feedbackForm});
            
            window.location.reload();
        }
        
        //Check if feedbackLink already exist
        var feedback = $firebaseObject(feedbackRef);
        feedback.$loaded().then(function(){
            if(feedback.$value) {
                $scope.feedbackLink = $sce.trustAsResourceUrl(feedback.$value);
            }
            
        });
    
  }
  
  
  
})();