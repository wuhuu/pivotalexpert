# pivotalexpert
Pivotal Expert 

# How to Run Locally:
Initial Run

1. Download and extract the file
2. Open command prompt in the directory where you've extracted the file
3. Run command 'npm install'
4. Run command 'npm run serve'

Subsequent Run

1. Open command prompt in the directory where you've extracted the file
2. Run 'npm run serve'
- Open browser and type "http://localhost:8080/#/home" as the url to view it locally.

# How to Deploy it to your firebase. 
Required Software to be pre-installed :

1. Git
2. Have Firebase Command Tools Install and login

Steps to deploy:

1. Clone down the copy using the following git command : 'git clone https://github.com/wuhuu/pivotalexpert.git'
2. Create a new project from firebase
3. Go to the auth tab in firebase, enable Google Login under "Sign-In Method"
4. Open web/app/common/common.service.js and replace the config (line 9 to 14) with your own firebase config
5. Direct back to \pivotalexpert\ folder
6. Run the following firebase command to add the project to your firebase and  deploy

 i) firebase use --add
    choose the firebase project when prompted
 ii) firebase deploy 
 
#How to enable Excel type Questions
Steps:
1. Sign in to google with your Administrator Account
2. Visit the two links bellow and click "enable"
       https://console.developers.google.com/apis/api/drive/overview?project=view-d2ba0&duration=PT1H
       https://console.developers.google.com/apis/api/sheets.googleapis.com/overview?project=view-d2ba0&duration=PT1H
