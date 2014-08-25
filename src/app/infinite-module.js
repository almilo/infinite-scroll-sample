'use strict';

angular.module('infinite', ['ngRoute'])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/infinite2', {
                templateUrl: 'infinite2.tpl.html',
                controller: 'InfiniteCtrl2'
            })
            .otherwise({
                redirectTo: '/infinite2'
            });
    });
