# Codevantage
Codevantage is an open source educational web based platform. Codevantage allows educators to transform their teaching content into an interactive learning experience for their students. It only takes 5 mins to deploy Codevantage.


# Pre-requisite Softwares
1. Node.js
Instructions to install can be found at https://nodejs.org/en/download/package-manager/
2. Firebase Command Tools
After installing Node.js, run 'npm install -g firebase-tools' in cmd.
3. Git (Optional)
Instructions to install can be found at https://git-scm.com/book/en/v2/Getting-Started-Installing-Git

# Initial Configuration
1. To download the application, you can choose:
  1. Using Git
    1. Go to your preferred directory, open cmd and run 'git clone https://github.com/wuhuu/pivotalexpert.git'

  2. Download via github.com
    1. Download files at https://github.com/wuhuu/pivotalexpert
    2. Click on the green 'Clone or download' button on the right.
    3. Unzip the file in your preferred directory.

2. Create and Change Firebase Settings
  1. Go to your https://firebase.google.com/ and login in with your Google Account and click to "Go to Console"
  2. Create a new project in Firebase
  3. At the home page, click "Add Firebase to your web app"
  4. After which, there will be prompt which will display some codes. DO NOT CLICK COPY! FOLLOW INSTRUCTIONS. Copy ONLY this snippet of the sample code before:
  ```
  var config = {
    apiKey: "<api-key>",
    authDomain: "https://<domain>",
    databaseURL: "https://<databaseURL>",
    storageBucket: "<URL>",
    messaging SenderId: "<id>"
  };
  ```
  5. At the Auth Tab on the left, click on "Sign-In Method" tab, then enable Google Login and click "Save".
  6. Return to your preferred directory folder, navigate to web > app > common and open "common.service.js" with a text editor(e.g notepad,text editor).
  7. Replace the "config" object(line 9 to line 15) with the one you have copied in Step 3.
  8. Replace the "adminEmail" object with your Google Account email which you planned to use as an educator.
  9. Replace the "courseName" object with your preferred application name.
  10. After which, save the file and exit the text editor.
3. Configure Google API
  1. Sign in to https://console.developers.google.com
  2. Click on the "Library" tab on the left and look for Google Apps API section and click on "Drive API". Click on "Enable" button on the top to activate this API.
  3. Click on the "Library" tab on the left and look for Google Apps API section and click on "Sheets API". Click on "Enable" button on the top to activate this API.



# Running locally
1. Initial Run
  1. Open cmd in your preferred directory folder and run 'npm install'
  2. After which, run 'npm run serve' and the web application will be run locally at http://locahost:8080
2. Subsequent Run
  1. Open cmd in your preferred directory folder and run 'npm run serve'

# Deploying it to Firebase
1. Open cmd in your preferred directory folder 
2. For initial use:
  1. run 'firebase login'
  2. run 'firebase init'
    1. When prompted "What Firebase CLI features do you want to setup for this folder?", press ENTER.
    2. When prompted "What file should be used for Database Rules?", press ENTER.
    3. When prompted "File database.rules.json already exists. Do you want to overwrite it with the Database Rules for undefined from the Firebase Console?", key in 'n' and ENTER.
    4. When prompted "What do you want to use as your public directory?", key in "web" and press ENTER.
    5. When prompted "Configure as a single-page app (rewrite all urls to /index.html)?", key in 'n' and ENTER.
    6. When prompted "File web/404.html already exists. Overwrite?", key in 'n' and ENTER.
  3. run 'firebase use --add'
    1. Choose the project you have created on Firebase and press ENTER.
    2. Type in an alias for the project and press ENTER.
3. Subsequently, as long as the firebase login account is the same, just run 'firebase deploy' to upload the application files to Firebase.
4. The link to the application will be listed in the cmd.
