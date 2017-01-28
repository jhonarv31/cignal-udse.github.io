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
app.controller("planCtrl", function($scope, $timeout) {
    $scope.loader = { isLoadingData: true };
    $scope.plans = [];

    var Plan = Parse.Object.extend("Plan");
    var query = new Parse.Query(Plan);
    query.ascending("plan");
    query.ascending("name");
    query.find({
        success: function(results) {
            var currentPlan, currentIndex = 0;
            if (results.length && results[0]) {
                $scope.plans[0] = [results[0]];
                currentPlan = results[0].get('plan');
            }

            for (var i = 1; i < results.length; i++) {
                var tempPlan = results[i].get('plan');
                if (currentPlan == tempPlan) {
                    $scope.plans[currentIndex].push(results[i]);
                } else {
                    currentIndex++;
                    currentPlan = tempPlan;
                    $scope.plans[currentIndex] = [results[i]];
                }
            }

            $scope.loader.isLoadingData = false;
            $scope.$apply();

            $timeout(function() {
                var accordion = UIkit.accordion('#plans-accordion', {});
            }, 1);

        },
        error: function(error) {
            console.log('Plan', error)
            $scope.loader.isLoadingData = false;
            $scope.$apply();
        }
    });

    $scope.showLargeImage = function(a, b) {
        var url = a || b;
        var lightbox = UIkit.lightbox.create([
            {'source': url, 'type':'image'}
        ]);

        lightbox.show();
    };
});