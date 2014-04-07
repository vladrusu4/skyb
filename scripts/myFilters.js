/**
 * Created by vlad.rusu on 4/7/14.
 */

//filter to bind the html for the match result
bskyb.filter('findMatch', function ($sce) {
    return function (result, searchParam) {
        var input = result.result;
        if (searchParam) {
            if (typeof searchParam === 'object'){
                searchParam = searchParam.result;
            }
            var words = searchParam.split(/\ /).join('|'),
                exp = new RegExp("(" + words + ")", "gi");

            if (words.length) {
                /// if a match is found then add in a span to make a css design
                input = input.replace(exp, "<span class=\"match\">$1</span>");
            }
        }
        var img = (result.model && result.model.thumbnail) ? result.model.thumbnail : null;

        ///for every item add also an image if that exists
        input = $sce.trustAsHtml('<a class="search-result">' +
            (img ? '<img src="assets/thumbnails/'+img+'" width="30" />' : '')+
            '<span>' + input+'<span class="clearfix"></span></span></a>');
        return input;
    };
});

/// filter to verify if the search input is contain in the movie object/title
bskyb.filter('movieFilter', function () {
    return function (input, searchParam, options) {
        var matches =  _.filter(input, function(movie){
            if (options.display){
                return movie[options.display].toLowerCase().indexOf(searchParam.toLowerCase()) >= 0;
            } else {
                return movie.toLowerCase().indexOf(searchParam.toLowerCase()) >= 0;
            }
        });
        return matches;
    };
});