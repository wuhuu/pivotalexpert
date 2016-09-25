(function() {

  angular
    .module('app.auth')
    .factory('authService', authService);

  function authService($firebaseObject, $firebaseAuth, $location, $rootScope, commonService) {
	  
	// create an instance of the authentication service
	var ref = firebase.database().ref();
	var auth = $firebaseAuth();
	var usersRef = ref.child('auth/users');
	
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
        
        ref.child('/signinLogs/' + user.uid).set(new Date().toLocaleString("en-US"));
        
        var userData = $firebaseObject(usersRef.child(user.uid));
        //navBarService.updateNavBar(user.displayName);
        userData.$loaded().then(function(){
            //load drive API to create if have not created before
            if(!userData.driveExcel) {
                //Create Google Folder upon login
                loadDriveApi();   
            }
            
            //Check whether login user email belong to admin account email
            var adminEmail = commonService.getAdminEmail().toUpperCase();
            
            //update admin role
            if(adminEmail.toUpperCase() === userData.email.toUpperCase()) {
                $rootScope.isAdmin = true;
                ref.child('auth/admin/admin').set(user.uid);
            }

            $rootScope.logined = true;
            if(userData.profileLink == null) {
              $location.path('/createProfileLink');
            }
            else{
              $location.path('/profile/' + userData.profileLink);
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
        gapi.client.load('drive', 'v3', createSpread);
    }
    
    function createSpread() {
        var spreadsheetID ;
        var folderId;
        
        var courseSetting = $firebaseObject(ref.child('/courseSetting'));
        
        courseSetting.$loaded().then(function(){
            
            var courseName = courseSetting.courseName;
            var folderName = courseName + " Folder";
            var sheetName = courseName + " Sheet";
            
            var folderRequest = gapi.client.drive.files.create({
              mimeType: "application/vnd.google-apps.folder",
              name: folderName
            });

            folderRequest.execute(function(response){
              folderId = response.id;
              var spreadsheetRequest = gapi.client.drive.files.create({
                  mimeType: "application/vnd.google-apps.spreadsheet",
                  name: sheetName,
                  parents: [folderId]
                });
                
                //Update Firebase with folderID
                usersRef.child($rootScope.userID).update({ driveFolder: folderId });

                spreadsheetRequest.execute(function(response){
                    spreadsheetID = response.id;
                    //Update Firebase with folderID
                    usersRef.child($rootScope.userID).update({ driveExcel: spreadsheetID });
                    
                    //Update Firebase with sheetID
                    usersRef.child($rootScope.userID).update({ sheetID: 0 });
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
                    })
                });
            });
        });
      }
  }

})();