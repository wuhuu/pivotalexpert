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

1. Download the zip file. 
2. Have firebase command line tools installed and login to your firebase account.
3. Run 'firebase init' to initialise the firebase project
 
    Run 'firebase list' to list the project link with the account and which point it refering to.
    If it is not pointed the firebase you intend to deploy to, run 'firebase use --add' to link the current project to your firebase project

4. Run 'firebase deploy' to deploy the project. 
