(function() {
  'use strict';

  angular
    .module('app.layout')
    .directive('peNavbar', peNavbar);

  function peNavbar() {
    return {
      templateUrl: 'app/layout/navbar.html',
      restrict: 'E',
    };
  }
  

})();