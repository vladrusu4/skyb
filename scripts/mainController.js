/**
 * Created by Vlad on 4/6/14.
 */
/*jslint nomen: true */
/*global angular, _ */

var bskyb = angular.module('bskybApp', ['ui.bootstrap']);

bskyb.controller('MainController', ['$scope', '$http', '$log', function ($scope, $http, $log) {
    'use strict';

    ///the list of movies from JSON file
    $scope.movies = [];

    ///method to get all movies from JSON file
    $scope.getMovies = function() {
        $scope.isLoading = true;
        return $http.get('results.json').success(function(movies){
            // if success then set the list of movies
            $scope.movies = movies;
        }).error(function(error, status){
            $log.log('Error get movie JSON', error, status);
        }).finally(function(){
            $scope.isLoading = false;
        });
    };

    $scope.getMovies();

    ///observer the searchMovie model to show/hide result panel
    $scope.$watch('searchMovie', function(value){
        if (typeof value === 'object'){
            $scope.moviesResults = true;
        } else {
            $scope.moviesResults = false;
        }
    });
}]);




