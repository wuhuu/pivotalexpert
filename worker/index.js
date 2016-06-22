//TODO: Turn in to a lambda function to run locally and on AWS. 
// Extend to pull from a Firebase queue that can be posted to.
// Log results of verifications back to a log that can be viewed. 
// No web API needed. All verification will take place by the lambda queue functions. 
// Only then worry about the untrusted code 
// accessing the firebase Token, timing out, or making unauthorized HTTP posts. 
var Queue = require('firebase-queue'),
    Firebase = require('firebase'),
    http = require('http'),
    request = require('request'),
    Mocha = require('mocha'),
    fs = require('fs');

console.log("The index file is " + __filename);
console.log("It's located in " + __dirname);


var firebaseUrl;
var ref;
var queueRef;
var queue;
var tmpFolder; 
var taskCount=0; 

var initiateFirebase = function(_firebaseUrl, firebaseToken){
    firebaseUrl = _firebaseUrl;
    ref = new Firebase(firebaseUrl);
    queueRef = new Firebase(firebaseUrl+'/queue');
    ref.authWithCustomToken(firebaseToken, function(error, authData) {
    if (error) {
        console.log("Login Failed!", error);
    } else {
        //console.log("Firebase login succeeded!");
        //console.log("Login Succeeded!", authData);
    }
    });  
}

function saveResult(passes, failures, errors,folder,data){
    finalResult = {'errors':errors,
                    'failures':failures,
                   'passes':passes
                };
    console.log("--- Final ---");
    console.log(finalResult);
    console.log("Results saved");
    
    finalResult["updated"] = Firebase.ServerValue.TIMESTAMP;
    finalResult["folder"] = folder;
    finalResult['data'] = data;
    ref.child('pivotalExpert/logs/verifyLogs').push(finalResult); //, function (err) {if (err){ } else {}}); 
    
}


var runTests = function (folder, data, resolve) {
    console.log("In run tests.");
    var mocha = new Mocha();
    mocha.reporter('JSON');
    mocha.addFile(folder+'/code.js');
    mocha.addFile(folder+'/code.spec.js');

    var errors = [];
    var failures = [];
    var passes = [];
    try {
        mocha.run()
            .on('pass', function (test) {
                passes.push({"title":test.title,
                            "body":test.body});
                console.log(test);
            })
            .on('fail', function (test, err) {
                if (err) {
                    test.err = {};
                    test.err.stack = err.stack;
                    test.err.message = err.message;
                }
                failures.push({"title":test.title,
                              "err":test.err,
                              "body":test.body});  
                console.log(test);    
                //errors.push(err.stack);
            })
            .on('end', function () {
                //console.log('Pass --------------');
                //console.log(passes);
                //console.log('Fail --------------');
                //console.log(failures);
                //console.log('Error --------------');
                //console.log(errors);
                //Save results back to context and exit. 
                saveResult(passes, failures, errors,folder,data);
            });
    }
    catch (err) {
        console.log("Caught error ", err.message);
        errors.push(err);
        //Save results back to context and exit. 
    }

}

// Called by Queue when new tasks are present. 
var process_task = function (data, progress, resolve, reject) {
  
  // Perhaps the tmp folder should be extended and made unique for each task and named by taskID. 
  // Mocha should be reset for next tests.   
  console.log("Task data", data);
  console.log("Code", data.code);
  console.log("Tests",data.tests);
  
          
   var testCode = [
    "var chai = require('"+__dirname+"/node_modules/chai/lib/chai.js'),",
    "expect = chai.expect;",
    "require('./code.js');",
    "",
    data.tests
   ].join("\n");
  
    taskCount += 1
    var verifyFolder = tmpFolder+"/"+taskCount;
    console.log("Running test in "+verifyFolder);
    
    //Make test directory if it doesn't exist
    if (!fs.existsSync(verifyFolder)){
        fs.mkdirSync(verifyFolder);
    }
     
    fs.writeFile(verifyFolder+"/code.spec.js", testCode, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The test file was saved!");
        fs.writeFile(verifyFolder+"/code.js", data.code, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The code file was saved!");
            runTests(verifyFolder, data, resolve);
        });
    }); 
    
  resolve();
 
}

var handler = function(event, context){
   
    //console.log( "event", event );
    //console.log("context", context);
    //console.log(process.env);
    console.log( "event code", event.code );
    console.log("event tests", event.tests);
    
    
    tmpFolder = process.env.TMP_FOLDER;
    console.log("TMP_FOLDER ", tmpFolder);

    

    
    
    var firebaseUrl = process.env.FIREBASE_URL;
    var firebaseToken = process.env.FIREBASE_TOKEN;
    if(firebaseUrl && firebaseToken){
      console.log("--------");
      console.log(firebaseUrl);
      console.log(firebaseToken);
      
      
      initiateFirebase(firebaseUrl, firebaseToken);
      
      var data = {"from":"handler", "updated":Firebase.ServerValue.TIMESTAMP};
      ref.child('queue/tasks').once('value', function (snapshot) {
     
          // code to handle new value
          var tasks = snapshot.val();

          if(tasks){
              console.log("There were tasks.");
              var delay = 20000;
              console.log("Starting queue for "+delay+"ms.")  
              var options = {
                'specId': 'lambda-worker',
                'numWorkers': 1, //Single threaded for now. 
                //'sanitize': false,
                //'suppressStack': true
                };
                
              queue = new Queue(queueRef, process_task);
              
              setTimeout(function() { queue.shutdown().then(function () {
                  console.log('Finished queue shutdown');
                  console.log("--------");
                  context.done();
                 }); 
            }, delay);
            
          }
          else {
              console.log("There were no tasks.");
              context.done();
          }
               
      }, function (err) {
          console.log(err);
          // code to handle read error
          context.done();
      });

      
    
    } else {
      console.log("firebaseUrl or firebaseToken missing. ");
      context.done();
    }
    
    //context.done();
    console.log("Finishing.");
    
}

// Do not run the server when loading as a module. 
if (require.main === module) {
  //queue = new Queue(queueRef, process_task);
  
  runTests(); 

  // Export modules if we aren't running the worker so that we can test functions. 
} else {

  module.exports = {
    "handler": handler
  }
}


