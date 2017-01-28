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
app.controller("logsCtrl", function($scope) {
    $scope.reservations = [];

    var Reservation = Parse.Object.extend("Reservation");
    var reservation = new Parse.Query(Reservation);
    reservation.equalTo("userPointer", Parse.User.current());
    reservation.find({
        success: function(results) {
            $scope.reservations = results;
            $scope.$apply();
        },
        error: function(error) {
            console.log('Parse.Query(Reservation)', error)
        }
    });

    $scope.formatDate = function(data){
        var date = new Date(data);
        return (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
    };

});