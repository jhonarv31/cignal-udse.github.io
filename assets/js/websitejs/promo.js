var currentLocation = window.location.href;

// Parse initialization
if (currentLocation.indexOf('localhost') > -1 || currentLocation.indexOf('127.0.0.1') > -1 ) {
    //Local setup
    Parse.initialize('myAppId', 'none');
    Parse.serverURL = "http://localhost:1337/parse";
} else {
    // Cloud server setup
    Parse.initialize('KRTa39mwa9G4VgqHHQeXBYc7iOJqVrvAxpGfidzC', '5dTrRR4kMumX0NfPjEVtnnxEur2BsHK4Ci9JIDKa');
    Parse.serverURL = 'https://parseapi.back4app.com/';
}

// MM DD, YYYY (ex: July 13, 2016)
Date.prototype.formatMMDDYYYY = function(){
    var date = this;
    var months = [{long: "January", short: "Jan"}, {long: "February", short: "Feb"}, {long: "March", short: "Mar"}, {long: "April", short: "Apr"}, {long: "May", short: "May"}, {long: "June", short: "Jun"}, {long: "July", short: "Jul"}, {long: "August", short: "Aug"}, {long: "September", short: "Sep"}, {long: "October", short: "Oct"}, {long: "November", short: "Nov"}, {long: "December", short: "Dec"}];
    return months[(date.getMonth())].short + ' ' + date.getDate() + ', ' + date.getFullYear();
};

var app = angular.module("App", []);
app.controller("promoCtrl", function($scope) {
    $scope.loader = { isLoadingData: true };
    $scope.posts = [];

    var Post = Parse.Object.extend("Post");
    var query = new Parse.Query(Post);
    query.descending('createdAt');
    query.find({
        success: function(results) {
            $scope.posts = results;
            $scope.loader.isLoadingData = false;
            $scope.$apply();
        },
        error: function(error) {
            console.log('Post', error)
            $scope.loader.isLoadingData = false;
            $scope.$apply();
        }
    });
});

app.directive('markdown', function () {
    var converter = new Showdown.converter();
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            function renderMarkdown() {
                var htmlText = converter.makeHtml(scope.$eval(attrs.markdown)  || '');
                element.html(htmlText);
            }
            scope.$watch(attrs.markdown, renderMarkdown);
            renderMarkdown();
        }
    };
});