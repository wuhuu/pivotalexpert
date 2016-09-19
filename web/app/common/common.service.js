(function() {

    angular
    .module('app.common', [])
    .factory('commonService', commonService);
	
  
  // Initialize Firebase
  var config = {      
    apiKey: "AIzaSyDt22-VriobDs7cNfkmY8yxHur9IQBewWo",
    authDomain: "pivotal-expert.firebaseapp.com",
    databaseURL: "https://pivotal-expert.firebaseio.com",
    storageBucket: "",
  };
  
  firebase.initializeApp(config);
  
  function commonService() {
	  
    //Replace with your login google account email
    var adminEmail = "Jianhua.Wu.2014@smu.edu.sg";

	var service = {
      getAdminEmail: getAdminEmail
    };
	
	return service;

    function getAdminEmail() {
      return adminEmail;
    }
  
  }

})();