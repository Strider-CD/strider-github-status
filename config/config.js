app.controller('EmailNotifierCtrl', ['$scope', function ($scope) {

  $scope.config = $scope.pluginConfig('emailnotifier')

  $scope.changeAlwaysNotify = function () {
    $scope.saving = true
    $scope.pluginConfig('emailnotifier', $scope.config, function (err) {
      $scope.saving = false
    })
  }

}]);
