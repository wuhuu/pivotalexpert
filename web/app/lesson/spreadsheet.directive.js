(function() {

  angular
    .module('app.layout')
    .directive('mvLessonSpreadsheet', mvLessonSpreadsheet);

  function mvLessonSpreadsheet() {
    return {
      templateUrl: 'app/lesson/spreadsheet.html',
      restrict: 'E',
	  //Add controllers method if there any assoicate with it
    };
  }
 
  

})();