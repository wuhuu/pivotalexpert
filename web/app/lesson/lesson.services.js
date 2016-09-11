(function() {

  angular
    .module('app.lesson')
    .factory('lessonService', lessonService);
  
  
  function lessonService() {
    var ref = firebase.database().ref();
    var user = firebase.auth().currentUser;

    var service = {

    };

    return service;
    
  }

})();