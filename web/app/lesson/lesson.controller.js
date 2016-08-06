(function() {

  angular
    .module('app.lesson')
    .controller('LessonController', LessonController);

  LessonController.$inject = ['$scope', '$routeParams', 'authService','navBarService'];

  function LessonController($scope, $routeParams, authService,navBarService) {
	
	
  };
  

})();