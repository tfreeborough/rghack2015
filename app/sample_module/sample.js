'use strict';

angular.module("SampleApp", [])
.config(['$routeProvider', function($routeProvider){
	$routeProvider
		.when('/sample', {
			templateUrl: "sample_module/sample.html",
			controller: "SampleCtrl"
		})
}])
.controller("SampleCtrl", ['$scope', function($scope){
	$scope.test = "DEMACIA!";
}])