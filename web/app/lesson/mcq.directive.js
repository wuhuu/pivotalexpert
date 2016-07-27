(function() {

  angular
    .module('app.layout')
    .directive('mvLessonMcq', mvLessonMcq);

  function mvLessonMcq() {
    return {
      templateUrl: 'app/lesson/mcq.html',
      restrict: 'E',
	  //Add controllers method if there any assoicate with it
	  controller: McqController
    };
  }
 
  McqController.$inject = ['$scope', '$http'];
  
  function McqController($scope, $http) {
	$http.get('course/Introudction.json').success(function(data) {
		$scope.challenge = data.challenges;
		console.log($scope.challenge);
		$scope.title = $scope.challenge[0].title;
		console.log($scope.title);
	});

  }
  

})();