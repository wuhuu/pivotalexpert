(function() {

  angular
    .module('app.landing')
    .controller('LandingController', LandingController);

  LandingController.$inject = ['$scope','$http', 'authService'];

  function LandingController($scope, $http, authService) {
      //Retrieve User Display Name
	  var user = authService.fetchAuthData();
	  if(user) {
	    user.$loaded().then(function () {
          $scope.displayName = user.displayName;
        });
	  } else {
		  $scope.displayName = "There";
	  }
	  
	  console.log("Home Page");
	  
	  $http.get('course/content.json').success(function(data) {
		
		$scope.courseMap = data.course.courseMap;

	});

    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/tomorrow_night_blue");
    editor.getSession().setMode("ace/mode/javascript");
    editor.setOption("maxLines", 10);

    $scope.vet = function(){
    	alert("hi");
    }
  }

})();