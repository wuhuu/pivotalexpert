(function() {

  angular
    .module('app.layout')
    .directive('mvLessonSlides', mvLessonSlides);

  function mvLessonSlides() {
    return {
      templateUrl: 'app/lesson/slides.html',
      restrict: 'E',
	  //Add controllers method if there any assoicate with it
    };
  }
 
  

})();