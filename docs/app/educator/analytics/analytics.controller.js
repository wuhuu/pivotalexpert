(function () {

  angular
    .module('app.analytics')
    .controller('AnalyticsController', AnalyticsController);

    function AnalyticsController ($scope) {
        $scope.bookPage = function () {
          window.location.href = '/#/educator/analytics/bid/stats';
        }

        
     }
  
})();