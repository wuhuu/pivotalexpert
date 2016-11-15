(function() {

  angular
    .module('app.feedback')
    .controller('FeedbackController', FeedbackController);

  function FeedbackController($scope, $sce, $firebaseObject) {
        console.log("FeedbackController");
        var ref = firebase.database().ref();
        var settingRef = ref.child('settings');
        var feedbackRef = settingRef.child('feedback');
        $scope.form = {};

        $scope.addFeedback = function() {
            console.log($scope.form.link);
            settingRef.update({"feedback" : $scope.form.link});
            window.location.reload();
        }

        $scope.delFeedback = function() {
          settingRef.child('feedback').set(null);
          $scope.feedbackLink = "";
        }

        //Check if feedbackLink already exist
        var feedback = $firebaseObject(feedbackRef);
        feedback.$loaded().then(function(){
            if(feedback.$value) {
                $scope.loadFeedback = true;
                $scope.feedbackLink = $sce.trustAsResourceUrl(feedback.$value);

            }

        });

  }



})();
