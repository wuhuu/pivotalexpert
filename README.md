# pivotalexpert
Pivotal Expert 

# How to Run Locally:
Initial Run

1. Run 'npm install' in cmd
2. Run 'npm run serve' in cmd

Subsequent Run

1. Run 'npm run serve' in cmd
- Open browser and type "http://localhost:8080/#/home" as the url to view it locally.

# How to Deploy it to your firebase. 
Required Software to be installed :

1. Git
2. Have Firebase Command Tools Install and login

Step to deploy:

1. Clone down the copy using the following git command : git clone https://github.com/wuhuu/pivotalexpert.git
2. Create a new project from firebase
3. Go to the auth tab in firebase, enable Google Login under "Sign-In Method"
4. Open web/app/common/common.service.js and edit your firebase api into the javascript file
5. Direct back to \pivotalexpert\ folder
6. Run the following firebase command to add the project to your firebsae and  deploy

 i) firebase use --add
 
 ii) firebase deploy 
