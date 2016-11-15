var app = window.app;

app.controller('GithubStatusCtrl', ['$scope', function ($scope) {
	$scope.saving = false;

	$scope.$watch('configs[branch.name]["github-status"].config', function (value) {
		$scope.config = value || {
			messages: {
				pending: 'Strider test in progress',
				success: 'Strider tests succeeded',
				failure: 'Strider tests failed',
				error: 'Strider tests errored',
			},
			context: 'default',
		};
	});

	$scope.save = function () {
		$scope.saving = true;
		$scope.pluginConfig('github-status', $scope.config, function () {
			$scope.saving = false;
		});
	};

}]);