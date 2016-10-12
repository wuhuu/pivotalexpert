(function() {

  angular
    .module('app.administrator')
    .controller('AdministratorController', AdministratorController);

  function AdministratorController($scope, $firebaseObject) {
	  console.log("AdministratorController");
      var ref = firebase.database().ref().child('auth');
      
      $scope.addAdmin = function() {
        console.log("ADD ADMIN");
        console.log($scope.newAdmin);
        
        var userID = $firebaseObject(ref.child($scope.newAdmin);
        userID.$loaded().then(function(){
            console.log("USER ID");
            console.log(userID.$value);
            //Add as sub admin to firebase
            ref.child('admin').update('subAdmins')
        });
      }
  }

})();