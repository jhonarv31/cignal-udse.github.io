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

var app = angular.module("App", ["vcRecaptcha"]);
app.controller("reservationCtrl", function($scope, vcRecaptchaService) {
    $scope.loader = { isSubmitting: false };
    $scope.newData2 = {};
    $scope.selectedCheckbox = [];
    $scope.othersTxt = '';
    var isRecaptchaSuccess;
    var checkboxData = ['INSTALL', 'ADD BOX', 'RELOCATION', 'REPAIR','OTHERS'];

    if (Parse.User.current()) {
        $scope.newData2.name = Parse.User.current().get('firstname') + ' ' + Parse.User.current().get('lastname');
        $scope.newData2.address = Parse.User.current().get('address');
        $scope.newData2.contact = Parse.User.current().get('contact');
        $scope.newData2.tel = Parse.User.current().get('tel');
    }

    $scope.recaptchaResponse = function (response) {
        if (response)
            isRecaptchaSuccess = true;
    };

    function isDateValid (date) {
        var today = new Date();
        today.setHours(0,0,0,0);
        date.setHours(0,0,0,0);

        return date >= today;
    }

    $scope.submitReservation = function() {
        console.log($scope.newData2)
        if (!Parse.User.current()) {
            notification('You must be logged in to continue', 'danger');
        } else {
            if (!isRecaptchaSuccess) {
                notification('reCaptcha required', 'danger');
            } else {
                if (!$scope.selectedCheckbox.length) {
                    notification('Service type required', 'danger');
                } else if ($scope.selectedCheckbox.indexOf(4) > -1 && !$scope.othersTxt) {
                    notification('Please specify "OTHERS"', 'danger');
                } else if (!$scope.newData2.date) {
                    notification('Date required', 'danger');
                } else if (!isDateValid($scope.newData2.date)) {
                    notification('Invalid date', 'danger');
                } else if (!$scope.newData2.address) {
                    notification('Address required', 'danger');
                } else if (!$scope.newData2.contact) {
                    notification('Contact required', 'danger');
                } else {
                    // generate type text
                    var typeArr = [];
                    $scope.selectedCheckbox.sort(function (a, b) { return a - b; });
                    for (var i = 0; i < $scope.selectedCheckbox.length; i++) {
                        var currentValue = $scope.selectedCheckbox[i];
                        if (currentValue !== 4)
                            typeArr.push(checkboxData[currentValue]);
                        else
                            typeArr.push($scope.othersTxt);
                    }

                    $scope.newData2.type = typeArr.join(', ');

                    submitReservationNext();
                }
            }
        }
    };

    function submitReservationNext () {
        console.log('submitReservation', $scope.newData2)

        $scope.newData2.status = 'PENDING';
        $scope.loader.isSubmitting = true;
        Parse.Cloud.run('addNewReservation', { data: $scope.newData2, userId: Parse.User.current().id }).then(function(response) {
            notification('Successfully sent your reservation');
            $scope.newData2 = {};
            $scope.loader.isSubmitting = false;
            isRecaptchaSuccess = false;
            $scope.$apply();
            vcRecaptchaService.reload();
        }, function(error) {
            console.log('addNewReservation', error)
            notification(error.message, 'danger');
            $scope.loader.isSubmitting = false;
            $scope.$apply();
        });
    }

    $scope.toggleCheckbox = function (value) {
        var index = $scope.selectedCheckbox.indexOf(value);

        if (index > -1)
            $scope.selectedCheckbox.splice(index, 1);
        else
            $scope.selectedCheckbox.push(value);

        if (value === 4)
            $scope.othersTxt = '';
    };

    function notification (msg, status, time, pos) {
        UIkit.notify({
            message : msg,
            status  : status || 'success',
            timeout : time || 2000,
            pos     : pos || 'top-center'
        });
    }
});