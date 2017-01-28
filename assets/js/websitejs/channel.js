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

var app = angular.module("App", []);
app.controller("channelCtrl", function($scope, $timeout) {
    $scope.loader = { isLoadingData: true };
    $scope.channels = [];

    var Channel = Parse.Object.extend("Channel");
    var query = new Parse.Query(Channel);
    query.ascending("name");
    query.ascending("type");
    query.find({
        success: function(results) {
            var currentType, currentIndex = 0;
            if (results.length && results[0]) {
                $scope.channels[0] = [results[0]];
                currentType = results[0].get('type');
            }

            for (var i = 1; i < results.length; i++) {
                var tempType = results[i].get('type');
                if (currentType == tempType) {
                    $scope.channels[currentIndex].push(results[i]);
                } else {
                    currentIndex++;
                    currentType = tempType;
                    $scope.channels[currentIndex] = [results[i]];
                }
            }

            $scope.loader.isLoadingData = false;
            $scope.$apply();

            $timeout(function() {
                var accordion = UIkit.accordion('#channels-accordion', {});
            }, 1);
        },
        error: function(error) {
            console.log('Channel', error)
            $scope.loader.isLoadingData = false;
            $scope.$apply();
        }
    });
});