(function() {

  angular
    .module('app.administrator')
    .controller('AdministratorController', AdministratorController);

  function AdministratorController($scope, $firebaseObject,$timeout, $q) {
	  console.log("AdministratorController");
      var ref = firebase.database().ref().child('auth');
      var adminRef = ref.child('admin');
      var subAdminRef = ref.child('admin/subAdmins');
      var userRef = ref.child('users');
      
      adminRef.once('value', function(snapshot) {
        $scope.adminID = snapshot.child('admin').val();
        $scope.adminShet = snapshot.child('spreadsheetID').val();
        loadAdminAuth();
      });
      $scope.admins = [];
      
      //$timeout(2000, loadAdmin());
      //function loadAdmin() {
        subAdminRef.once('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var userID = childSnapshot.key;
                var permissionID = snapshot.child(userID).val();
                var user = userRef.child(userID);
                user.once('value', function(userSnapshot) {
                    $scope.admins.push({name : userSnapshot.child('displayName').val(), email : userSnapshot.child('email').val(), userID: userID, permissionID: permissionID})
                });
            });
        });
      //}
      
      $scope.removeAdmin = function(index){
        var user = $scope.admins[index];
        removePermission(user.permissionID);
        subAdminRef.child(user.userID).set(null);
        $scope.admins.splice(index, 1);
      }
    
      $scope.addAdmin = function() {
        $scope.invalid = false;
        var userID = $firebaseObject(ref.child('usedLinks/' + $scope.newAdmin));
        userID.$loaded().then(function(){
            if(userID.$value) {
                //retrieve email and grant permission for excel spreadsheet
                var user = $firebaseObject(userRef.child(userID.$value));
                user.$loaded().then(function(){
                    var userEmail = user.email;
                    addPermission(userEmail, $scope.adminShet, userID.$value);
                });
                $scope.newAdmin = "";
                $scope.invalid = false;
            } else {
                $scope.invalid = true;
            }
           
        });
      }
            
    function addPermission(email, spreadsheet, userID) {
        gapi.client.load('drive', 'v3', function () {
            gapi.client.drive.permissions.create({
                fileId: spreadsheet,
                type: "user",
                role: "writer",
                emailAddress: email
            }).then(function(response) {
                //Add as sub admin to firebase
                subAdminRef.child(userID).set(response.result.id);
                window.location.reload();
            });
        });
    }
    
    function removePermission(permissionID) {
        gapi.client.load('drive', 'v3', function () {
            gapi.client.drive.permissions.delete({
                fileId: $scope.adminShet,
                permissionId: permissionID
            }).then(function(response) {

            });
        });
    }
    
    function loadAdminAuth() {
        var user = userRef.child($scope.adminID);
        user.once('value', function(userSnapshot) {
            gapi.auth.setToken({
                access_token: userSnapshot.child('access_token').val()
            });
        });
    }
    
    
  }
  
  
  
})();