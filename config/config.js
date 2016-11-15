var app = window.app;

app.controller('GithubStatusCtrl', ['$scope', function ($scope) {
	$scope.config = {
		messages: {
			pending: 'Strider test in progress',
			success: 'Strider tests succeeded',
			failure: 'Strider tests failed',
			error: 'Strider tests errored',
		},
		context: 'ci/strider',
	};
	$scope.saving = false;

	$scope.$watch('configs[branch.name]["github-status"].config', function (value) {
		for (var p in value) {
			if (value.hasOwnProperty(p)) {
				$scope.config = value;
				break;
			}
		}
	});

	$scope.save = function () {
		$scope.saving = true;
		$scope.pluginConfig('github-status', $scope.config, function () {
			$scope.saving = false;
		});
	};

}]);