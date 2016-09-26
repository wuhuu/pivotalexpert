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
  
  function commonService($mdToast) {
	  
    //Replace with your login google account email
    var adminEmail = "Jianhua.Wu.2014@smu.edu.sg";

	var service = {
      getAdminEmail: getAdminEmail,
      guid: guid,
      showSimpleToast:showSimpleToast
    };
	var last = {
        bottom: false,
        top: true,
        left: true,
        right: false
      };

  var toastPosition = angular.extend({},last);

	return service;

    function getAdminEmail() {
      return adminEmail;
    }
    
    
    function guid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      }
      return s4() + s4() + s4() + s4();
    }
   
    function getToastPosition(){
      sanitizePosition();

      return Object.keys(toastPosition)
        .filter(function(pos) { return toastPosition[pos]; })
        .join(' ');
    };

    function sanitizePosition() {
      var current = toastPosition;

      if ( current.bottom && last.top ) current.top = false;
      if ( current.top && last.bottom ) current.bottom = false;
      if ( current.right && last.left ) current.left = false;
      if ( current.left && last.right ) current.right = false;

      last = angular.extend({},current);
    }

    function showSimpleToast(msg) {
      var pinTo = getToastPosition();

      $mdToast.show(
        $mdToast.simple()
          .textContent(msg)
          .position(pinTo)
          .hideDelay(3000)
      );
    };
  }

})();