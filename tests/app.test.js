
describe('app', function () {

  beforeEach(module('app'));
  angular.module('firebase', []);

  var $controller;

  beforeEach(inject(function (_$controller_) {
    $controller = _$controller_;
  }));

  describe('SampleCtrl', function () {


    it('getTheTime should work.', function () {
      var $scope = {};
      $scope.ref = function(){};
      var controller = $controller('SampleCtrl', {
        $scope: $scope,
        $firebaseArray: function () { },
        $firebaseObject: function () { },
        $firebaseAuth: function () { }
      });

      expect($scope.getTheTime(1464172652971))
        .toBe('Wed May 25 2016 18:37:32 GMT+0800 (SGT)');

    });

    it('timePassed should be greater than 8000.', function () {
      var $scope = {};
      var controller = $controller('SampleCtrl', {
        $scope: $scope,
        $firebaseArray: function () { },
        $firebaseObject: function () { },
        $firebaseAuth: function () { }
      });

      expect($scope.timePassed(1464172652973) > 7000)
        .toBe(true);
    });


    it('logout should work.', function () {
      var $scope = {};
      var controller = $controller('SampleCtrl', {
        $scope: $scope,
        $firebaseArray: function () { },
        $firebaseObject: function () { },
        $firebaseAuth: function () { }
      });

      $scope.logout();

    });
  });
});