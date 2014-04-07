/**
 * Created by vlad.rusu on 4/7/14.
 */

///directive for autocomplete
bskyb.directive('movieAutocomplete', function($compile, $window, $position, $filter) {
    return {
        require: 'ngModel',
        scope: {
            options: '=options',
            suggestions: '=data',
            searchQuery: '=ngModel',
            onSelect: '=onSelect'
        },
        restrict: 'E',
        //the template contains a list of results and a show all option
        template:
            '<div class="movie-autocomplete {{attrs.class}}">'+
                '<input type="text" ng-model="movieSearchQuery" placeholder="{{attrs.placeholder}}" class="form-control {{attrs.inputclass}}"/>' +
                '<div class="dropdown-menu" ng-show="isOpen()" ng-style="{display: isOpen()&&\'block\' || \'none\', top: position.top+\'px\'}">' +
                '<div class="col-xs-5">' +
                '<label>MOVIES</label>' +
                '<a ng-click="showAllMovies()">SHOW ALL</a>' +
                '</div> ' +
                '<div class="col-xs-7">' +
                '<ul>' +
                '<li movie-result ng-repeat="movie in matches | orderBy:\'toString()\' track by $index"'+
                'index="{{$index}}" val="{{movie.result}}" ng-class="{active: '+
                '($index == selectedIndex)}" ng-click="select(movie)"' +
                'ng-bind-html="movie | findMatch:movieSearchQuery">'+
                '</li>'+
                '</ul>'+
                '</div>' +
                '<div class="clearfix"></div>' +
                '</div> ' +

                '</div>',

        ///set a controller that will be passed to another directive
        controller: function($scope){
            this.select = function(suggestion){
                if(suggestion){
                    $scope.movieSearchQuery = suggestion.result;
                    $scope.searchQuery = {
                        movies:[suggestion],
                        query: suggestion.result
                    };
                    if($scope.onSelect) {
                        $scope.$eval($scope.onSelect);
                    }
                    $scope.$apply();
                }
                $scope.stayOpen = false;
                $scope.matches = [];
                $scope.allResults = [];
                this.selectedIndex = -1;
            };

            this.selectedIndex = -1;

            this.setIndex = function(index){
                $scope.selectedIndex = index;
            };

            $scope.select = this.select;
            $scope.selectedIndex = this.selectedIndex;

            $scope.showAllMovies = function(){
                $scope.searchQuery = {
                    movies:$scope.allResults,
                    query: $scope.movieSearchQuery
                };
                $scope.stayOpen = false;
                $scope.matches = [];
                $scope.allResults = [];
                this.selectedIndex = -1;
            };

        },
        link:function (scope, element, attrs, controller) {
            ///default attrs
            scope.attrs = {
                "placeholder": "Search",
                "class": "",
                "inputclass": ""
            };

            ///init attrs to be used in template and current scope
            for (var a in attrs) {
                attr = a.replace('attr', '').toLowerCase();
                if (_.has(scope.attrs, attr)){
                    scope.attrs[attr] = attrs[a];
                }
            }

            var opts = {},
                $input = element.find('input');

            scope.matches = [];

            ///method to verify if the dropdown it's open or not
            scope.isOpen = function () {
                return scope.matches.length > 0 && scope.stayOpen;
            };

            element.bind('blur', function () {
                console.log('blur');
                scope.stayOpen = false;
            });

            ///parse options set for the directive
            ///minLength - how many char should be enter to start searching
            ///previewItems - how many items will be displayed in dropdown
            ///display - witch field should be displayed in input text on search select
            if (scope.options) {
                opts.minLength = scope.options.minLength || 1;
                opts.previewItems = scope.options.previewItems || 10;
                if (scope.options.display) {
                    opts.display = scope.options.display;
                }
            } else {
                opts.minLength = 1;
                opts.previewItems = 10;
            }

            ///method to calculate the position for dropdown (will be with pos absolute)
            ///the position can cotains: top, left, right, bottom
            var calculatePosition = function(){
                scope.position = $position.position($input);
                scope.position.top = $input.outerHeight(true);
                scope.width = $input.outerWidth();
            };

            ///method the get all movies based on the search input
            var getMovies = function(inputValue){
                ///apply filter over the movie list
                var matches = $filter('movieFilter')(scope.suggestions, inputValue, scope.options);
                if (matches.length){
                    calculatePosition();
                }
                return matches;
            };

            ///observer if the text in autocomplete input is changed
            scope.$watch('movieSearchQuery', function(inputValue, oldValue){
                if (oldValue === inputValue) {
                    return;
                }
                scope.matches = [];
                scope.allResults = [];
                if (inputValue && inputValue.length >= opts.minLength) {
                    scope.stayOpen = true;
                    var matches = getMovies(inputValue);
                    if (matches && matches.length){
                        scope.selectedIndex = 0;
                        var i = 0;
                        ///add in matches si allResults objects the result items
                        _.each(matches, function(val){
                            if (i<opts.previewItems) {
                                scope.matches.push({
                                    result: opts.display ? val[opts.display] : val,
                                    model: val
                                });
                            }
                            scope.allResults.push({
                                result: opts.display ? val[opts.display] : val,
                                model: val
                            });
                            i += 1;
                        });
                    }
                } else {
                    scope.matches = [];
                    scope.stayOpen = false;
                }
            });


            /// add event listeners for keydown
            var key = {down: 40, up: 38, enter: 13, esc: 27};
            document.addEventListener("keydown", function(e){
                var keycode = e.keyCode || e.which;
                switch (keycode){
                    case key.esc:
                        scope.select();
                        scope.selectedIndex = -1;
                        scope.$apply();
                        e.preventDefault();
                }
            }, true);

            element[0].addEventListener("keydown",function (e){
                var keycode = e.keyCode || e.which,
                    index;

                var l = angular.element(this).find('li').length;
                ///if one of the key from key object is pressed then
                ///change the selected item
                switch (keycode){
                    case key.up:
                        index = scope.selectedIndex-1;
                        if(index<=-1){
                            index = l-1;
                        } else if (index >= l ){
                            index = 0;
                        }
                        scope.selectedIndex = index;
                        scope.$apply();
                        break;
                    case key.down:
                        index = scope.selectedIndex + 1;
                        if(index<=-1){
                            index = l-1;
                        } else if (index >= l ){
                            index = 0;
                        }
                        scope.selectedIndex = index;

                        scope.$apply();
                        break;
                    case key.enter:
                        index = scope.selectedIndex;
                        if(index!==-1){
                            scope.select(scope.matches[index]);
                        }
                        scope.selectedIndex = -1;
                        if (scope && scope.$apply){
                            scope.$apply();
                        }
                        break;
                    default:
                        return;
                }
                if(scope.selectedIndex!==-1 || keycode == key.enter) {
                    e.preventDefault();
                }
            });
        }
    };
});

///directive used for dropdown result
bskyb.directive('movieResult', function(){
    return {
        restrict: 'A',
        require: '^movieAutocomplete',
        link: function(scope, element, attrs, autoCtrl){
            ///for every result item add mouse events to set the active item
            element.bind('mouseenter', function() {
                autoCtrl.setIndex(attrs['index']);
                scope.$apply();
            });
            element.bind('click', function(e) {
                autoCtrl.setIndex(-1);
                autoCtrl.select(attrs['value']);
                scope.$apply();
                e.preventDefault();
            });
        }
    }
});