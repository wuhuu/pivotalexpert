(function() {

    angular
    .module('app.common', [])
    .factory('commonService', commonService);

  function commonService($mdToast,$mdDialog) {

	var service = {
      guid: guid,
      showSimpleToast:showSimpleToast
    };


	var last = {
        bottom: true,
        top: false,
        left: false,
        right: true
      };

    var toastPosition = angular.extend({},last);

	return service;

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
