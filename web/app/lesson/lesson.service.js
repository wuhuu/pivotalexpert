(function() {

  angular
    .module('app.lesson')
    .factory('lessonService', lessonService);
  
  function lessonService($q) {

    var service = {
        runTestcase : runTestcase
    };
    
    return service;    
    
    function runTestcase(testCase, code) {
    
        var deferred = $q.defer();
        
        
        
        var totalTestNum =  testCase.length;
        for (i = 0; i < totalTestNum; i++) { 
            var test =  testCase[i];
            var ww = new Worker(getInlineJSandTest(test, code));
            //Send any message to worker
            ww.postMessage("and message");
            ww.onmessage = function (e) {
                var msg = e.data;
                console.log("Message from worker--> ",msg); 
                deferred.resolve(true);
                //check if there failed result
                if(msg === false) {
                    console.log("Set deferred resolve to false"); 
                    deferred.resolve(false); //change to .reject(reason) if want to includes hint/reason for failed test case
                }
            };
            
        }

        return deferred.promise;
    }
    
    function getInlineJSandTest (test, code) {
		var top = 'onmessage = function(msg){';
		var bottom = 'postMessage(result);};';

		var all = test +"\n\n"+top+"\n"+code+"\n"+bottom+"\n"
		var blob = new Blob([all], {"type": "text\/plain"});
		return URL.createObjectURL(blob);
	}
    
  }

})();
