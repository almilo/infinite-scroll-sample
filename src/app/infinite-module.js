'use strict';

angular.module('infinite', ['ngRoute'])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/infinite', {
                templateUrl: 'infinite.tpl.html',
                controller: 'InfiniteCtrl'
            })
            .otherwise({
                redirectTo: '/infinite'
            });
    });
