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
app.controller("customerServiceCtrl", function($scope, vcRecaptchaService) {
    console.log('customerServiceCtrl')

    $scope.loader = { isSubmitting: false };
    $scope.newData2 = {};
    var isRecaptchaSuccess;

    if (Parse.User.current()) {
        $scope.newData2.name = Parse.User.current().get('firstname') + ' ' + Parse.User.current().get('lastname');
    }

    $scope.recaptchaResponse = function (response) {
        if (response)
            isRecaptchaSuccess = true;
    };

    $scope.submit = function() {
        if (!Parse.User.current()) {
            notification('You must be logged in to continue', 'danger');
        } else {
            if (!isRecaptchaSuccess) {
                notification('reCaptcha required', 'danger');
            } else {
                console.log('submitReservation', $scope.newData2)

                $scope.loader.isSubmitting = true;
                Parse.Cloud.run('addNewCustomerService', { data: $scope.newData2 }).then(function(response) {
                    notification('Successfully sent your request');
                    $scope.newData2 = {};
                    $scope.newData2.name = Parse.User.current().get('username');
                    $scope.loader.isSubmitting = false;
                    isRecaptchaSuccess = false;
                    $scope.$apply();
                    vcRecaptchaService.reload();
                }, function(error) {
                    console.log('addNewCustomerService', error)
                    notification(error.message, 'danger');
                    $scope.loader.isSubmitting = false;
                    $scope.$apply();
                });

            }
        }
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