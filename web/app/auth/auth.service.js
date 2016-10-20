(function() {

  angular
    .module('app.auth')
    .factory('authService', authService);

  function authService($firebaseObject, $firebaseAuth, $location, $rootScope, commonService) {
      
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
            
            //Check whether login user email belong to admin account email
            var adminEmail = commonService.getAdminEmail().toUpperCase();
            
            //update admin role
            if(adminEmail.toUpperCase() === userData.email.toUpperCase()) {
                $rootScope.mainAdmin = true;
                ref.child('auth/admin/admin').set(user.uid);
                
                //console.log($rootScope.folderID)
                adminRef.once('value', function(snapshot) {
                  if (!snapshot.hasChild('spreadsheetID') && userData.driveExcel) {
                    //create edu sheet
                    $rootScope.folderID = userData.driveFolder;
                    createEduSheetAPI();
                  }
                });
            } else {
                //Retrieve subAdmin from firebase
                adminRef.child('subAdmins').once('value', function(snapshot) {
                  snapshot.forEach(function(childSnapshot) {
                    if(childSnapshot.key == userData.$id) {
                      $rootScope.isAdmin = true;
                    }
                  });   
                });
            }
            //load drive API to create if have not created before. Excute once only
            if(!userData.driveExcel) {
                //Create Google Folder upon login
                loadDriveApi();   
            }
            
            $rootScope.logined = true;
            if(userData.profileLink == null) {
              $location.path('/createProfileLink');
            } else if($rootScope.isAdmin || $rootScope.mainAdmin){
                $location.path('/educator/courseLibrary/');
            }
            else{
              $location.path('/course/');
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
            
            var courseName = commonService.getCouseName();
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