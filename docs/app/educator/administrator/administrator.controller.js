(function() {

  angular
    .module('app.administrator')
    .controller('AdministratorController', AdministratorController);

  function AdministratorController($scope, $rootScope, $location, $firebaseObject,$timeout, $q, $mdDialog) {
	  console.log("AdministratorController");

      var ref = firebase.database().ref().child('auth');
      var adminRef = ref.child('admin');
      var subAdminRef = ref.child('admin/subAdmins');
      var userRef = ref.child('users');

      $scope.admins = [];

      adminRef.once('value', function(snapshot) {
        $scope.adminID = snapshot.child('admin').val();
        $scope.adminShet = snapshot.child('spreadsheetID').val();
        loadAdminAuth();
      });


      $timeout(1000, loadAdmin());
      function loadAdmin() {
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
      }

      $scope.removeAdmin = function(index){
        var user = $scope.admins[index];
        if(user.permissionID != -1) {
          removePermission(user.permissionID);
        }
        subAdminRef.child(user.userID).set(null);
        $scope.admins.splice(index, 1);
      }

      //$scope.invalid = false;
      $scope.addAdmin = function() {

        var userID = $firebaseObject(ref.child('usedLinks/' + $scope.newAdmin));
        userID.$loaded().then(function(){
            if(userID.$value) {

                if($scope.adminShet) {
                  //retrieve email and grant permission for excel spreadsheet
                  var user = $firebaseObject(userRef.child(userID.$value));
                  user.$loaded().then(function(){
                      var userEmail = user.email;
                      addPermission(userEmail, $scope.adminShet, userID.$value);
                  });
                } else {
                  subAdminRef.child(userID.$value).set(-1);
                  window.location.reload();
                }
            } else {
                $scope.invalid = true;
            }

        });
      }

     /*
      $scope.addAdmin = function() {

        var promise = searchForEmail();
        promise.then(function(userID) {
            if(userID){
                //Update Firsebase
                subAdminRef.child(userID).set(-1);

                //check if spreadsheetID exist, if so add permission
                adminRef.child("spreadsheetID").once('value', function(snapshot) {
                   if(snapshot.val()) {
                     addPermission($scope.newAdmin, snapshot.val(), userID);
                   } else {
                     window.location.reload();
                   }
                });
            } else {
                $scope.invalid = true;
            }
        })
      }
    */
    function searchForEmail() {
        var defer = $q.defer();
        userRef.once('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var userID = childSnapshot.key;
                var email = childSnapshot.child("email").val().toUpperCase();
                if($scope.newAdmin.toUpperCase() === email) {
                    defer.resolve(userID);
                    return defer.promise;
                }
            });
             defer.resolve(false);
        });
        return defer.promise;
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
            }, function(response) {
              var errorCode = response.result.error.code;
              if (errorCode == 404) {
                  showErrorDialog("Could not find the spreadsheet. If this keep occur, manually delete the spreadsheet from firebase and re-login.");
              } else {
                  showErrorDialog("Failed to add permissions to spreadsheet. Please try again. If this occur again, please logout and signin again." );
              }
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

    function showErrorDialog(msg) {
      var confirm = $mdDialog.confirm()
          .title('Spreadsheet permissions Failed')
          .textContent(msg)
          .ok('closes');

        $mdDialog.show(confirm).then(function() {
            //auth user again
            var user = firebase.auth().currentUser.getToken(true)
            .then(function(idToken) {
                gapi.auth.setToken({
                    access_token: idToken
                });
            });
            window.location.reload();
        });
    }


  }



})();
