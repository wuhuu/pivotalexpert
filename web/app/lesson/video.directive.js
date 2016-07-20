(function() {

  angular
    .module('app.layout')
    .directive('mvLessonVideo', mvLessonVideo);

  function mvLessonVideo() {
    return {
      templateUrl: 'app/lesson/video.html',
      restrict: 'E',
	  //Add controllers method if there any assoicate with it
    };
  }
 
  

})();