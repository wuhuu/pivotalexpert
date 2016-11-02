(function() {

  angular
    .module('app.auth')
    .factory('authService', authService);
  function authService($firebaseObject, $firebaseAuth, $location, $rootScope, $http, commonService) {


    // create an instance of the authentication service
    var ref = firebase.database().ref();
    var auth = $firebaseAuth();
    var usersRef = ref.child('auth/users');
    var adminRef = ref.child('auth/admin');

    var service = {
      login: login,
      logout: logout,
      fetchAuthData: fetchAuthData,
    };

    return service;

    //Different function of the auth service
    function login() {

      var provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/userinfo.email');
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      provider.addScope('https://www.googleapis.com/auth/spreadsheets');
      provider.addScope('https://www.googleapis.com/auth/cloud-platform');

      firebase.auth().signInWithPopup(provider).then(function(result) {

        console.log("login success");
        // The signed-in user info.
        var user = result.user;
        $rootScope.userID = user.uid;
        var loginEmail = user.providerData[0].email;
        var token = result.credential.accessToken;

        usersRef.child(user.uid).update({
          pic: user.photoURL,
          email: loginEmail,
          displayName: user.displayName,
          access_token: token
        });

        // set the authentication token
        gapi.auth.setToken({
            access_token: token
        });

        //Create signin log
        var dateTimeNow = new Date().toISOString().slice(0,10);
        ref.child('/signinLogs/' + user.uid + '/' + dateTimeNow).set(true);

        var userData = $firebaseObject(usersRef.child(user.uid));
        //navBarService.updateNavBar(user.displayName);
        userData.$loaded().then(function(){

            //load drive API to create if have not created before. Excute once only
            if(!userData.driveExcel || !userData.driveFolder) {
                //Create Google Folder upon login
                loadDriveApi();
            }


            //Check whether login is an admin or sub-admin
            adminRef.once('value', function(snapshot) {
              if(!snapshot.child('admin').val()) { //if admin ID have not been set yet. Set the owner of the firebase as the main admin
                var firebaseDomain = firebase.database().app.options.authDomain;
                firebaseDomain = firebaseDomain.split(".");
                var projectName = firebaseDomain[0];
                var discoveryUrl = 'https://cloudresourcemanager.googleapis.com/$discovery/rest?version=v1';
                gapi.client.load(discoveryUrl).then(function() {
                    console.log("TESTING123");
                    gapi.client.cloudresourcemanager.projects.getIamPolicy({
                        resource: projectName
                    }).then(function(response) {
                        for(var i = 0; i < response.result.bindings.length; i++){
                            var roles = response.result.bindings[i].role;
                            if(roles === "roles/owner") {
                                var ownerEmail = response.result.bindings[i].members[0].substring(5);
                                var currentEmail = userData.email;
                                if(ownerEmail.toUpperCase() === currentEmail.toUpperCase()) {
                                    usersRef.child(user.uid).update({
                                      isAdmin: true
                                    }).then(function() {
                                        adminRef.child('admin').set(userData.$id);
                                    });
                                    $rootScope.mainAdmin = true;
                                    createEduSheetAPI();
                                }
                            }
                        }
                    });
                });
              } else if(snapshot.child('admin').val() === userData.$id) {
                //check whether login user is main admin
                $rootScope.mainAdmin = true;
                if(!snapshot.child('spreadsheetID').val()) {
                    //create edu sheet
                    $rootScope.folderID = userData.driveFolder;
                    createEduSheetAPI();
                }
              }
              if(snapshot.child('subAdmins').val()) {
                var subadmins = snapshot.child('subAdmins').val();
                for (var subadmin in subadmins) {
                   if(subadmin == userData.$id) {
                        $rootScope.isAdmin = true;
                    }
                }
              }
            });

            $rootScope.logined = true;
            if(userData.profileLink == null) {
              //$location.path('/createProfileLink');
            } else if($rootScope.isAdmin || $rootScope.mainAdmin){
                //$location.path('/educator/courseLibrary/');
            }
            else{
              //$location.path('/course/');
            }
        });
      });
    }

    function logout() {
      return firebase.auth().signOut();
    }

    function fetchAuthData() {
      firebase.auth().onAuthStateChanged(function(user) {

          if (user) {
            // User is signed in.
            console.log("Fetching fetchAuthData " + user.uid);
            return firebase.auth().currentUser;

          } else {
            // No user is signed in.
            console.log("not login, auth.service");
            if($location.path != "/login") {
                $location.path('/login');
            } else {
                return null;
            }
          }
      });
    }

    function loadDriveApi() {
        var discoveryUrl = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
        gapi.client.load(discoveryUrl);
        gapi.client.load('drive', 'v3', createDriveFolder);
    }

    function createEduSheetAPI() {
        var discoveryUrl = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
        gapi.client.load(discoveryUrl);
        gapi.client.load('drive', 'v3', createEduSheet);
    }

    function createDriveFolder() {
        var spreadsheetID ;

        var courseSetting = $firebaseObject(ref.child('/courseSetting'));

        courseSetting.$loaded().then(function(){

            var folderName = courseName + " Folder";
            var studSheetName = courseName + " Sheet";
            var eduSheetName = courseName + "_Educator_Sheet";

            var folderRequest = gapi.client.drive.files.create({
              mimeType: "application/vnd.google-apps.folder",
              name: folderName
            });

            folderRequest.execute(function(response){
              $rootScope.folderID = response.id;
              //Update Firebase with folderID
              usersRef.child($rootScope.userID).update({ driveFolder: $rootScope.folderID });

              //Create Sheet for student
              var studSheetRequest = gapi.client.drive.files.create({
                  mimeType: "application/vnd.google-apps.spreadsheet",
                  name: studSheetName,
                  parents: [$rootScope.folderID]
              });
                studSheetRequest.execute(function(response){
                    spreadsheetID = response.id;
                    //Update Firebase with folderID
                    usersRef.child($rootScope.userID).update({ driveExcel: spreadsheetID });

                    gapi.client.sheets.spreadsheets.batchUpdate({
                      spreadsheetId: spreadsheetID,
                      requests:[{
                          updateSheetProperties:
                          {
                            properties:
                            {
                              title: "Instructions",
                              sheetId: 0
                            },
                            fields: "title"
                          }
                        }
                      ]
                    });
                });

                //if educator, create educator sheet
                if($rootScope.mainAdmin) {
                    createEduSheet();
                }
            });
        });
      }

    function createEduSheet() {

        var eduSheetName = "Educator_Question_Sheet";

        var eduSheetRequest = gapi.client.drive.files.create({
          mimeType: "application/vnd.google-apps.spreadsheet",
          name: eduSheetName,
          parents: [$rootScope.folderID]

        });
        eduSheetRequest.execute(function(response){
            var spreadsheetID = response.id;

            //Update Firebase with admin spreadsheetID
            adminRef.update({ spreadsheetID: spreadsheetID });

            gapi.client.sheets.spreadsheets.batchUpdate({
              spreadsheetId: spreadsheetID,
              requests:[{
                  updateSheetProperties:
                  {
                    properties:
                    {
                      title: "Instructions",
                      sheetId: 0
                    },
                    fields: "title"
                  }
                }
              ]
            });

            gapi.client.drive.permissions.create({
                fileId: spreadsheetID,
                role: "reader",
                type: "anyone"
            }).then(function(response) {
            });

        });
      }
  }

})();
