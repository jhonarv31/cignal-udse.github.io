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
app.controller("customerServiceCtrl", function($scope) {
    $scope.loader = { isSubmitting: false };
    $scope.data = {};
    var currentUser = Parse.User.current()

    if (!currentUser)
        window.location.href = "index.html";

    initialize();

    $scope.submit = function() {
        if ($scope.data.newPassword && $scope.data.retypePassword) {
            if ($scope.data.newPassword != $scope.data.retypePassword) {
                notification('Password mismatch', 'danger');
            } else {
                saveContinue();
            }
        } else {
            saveContinue();
        }
    };

    function saveContinue () {
        $scope.loader.isSubmitting = true;

        if ($scope.data.newPassword && $scope.data.retypePassword)
            currentUser.set('password', $scope.data.newPassword);

        currentUser.set('name', $scope.data.name);
        currentUser.set('firstname', $scope.data.firstname);
        currentUser.set('middlename', $scope.data.middlename);
        currentUser.set('contact', $scope.data.contact);
        currentUser.set('email', $scope.data.email);

        currentUser.save().then(function() {
            if ($scope.data.newPassword && $scope.data.retypePassword) {
                // Relogin the user
                Parse.User.logIn($scope.data.username, $scope.data.newPassword, {
                    success: function(user) {
                        notification('Settings saved');
                        initialize();

                        $scope.loader.isSubmitting = false;
                        $scope.$apply();
                    },
                    error: function(error) {
                        console.log("Error: " + error.code + " " + error.message);
                        notification(error.message, 'danger');
                        $scope.loader.isSubmitting = false;
                        $scope.$apply();
                    }
                });
            } else {
                notification('Settings saved');
                initialize();

                $scope.loader.isSubmitting = false;
                $scope.$apply();
            }
        });
    }

    function initialize() {
        $scope.data.username = currentUser.get('username');
        $scope.data.name = currentUser.get('name');
        $scope.data.firstname = currentUser.get('firstname');
        $scope.data.middlename = currentUser.get('middlename');
        $scope.data.contact = currentUser.get('contact');
        $scope.data.email = currentUser.get('email');
    }

    function notification (msg, status, time, pos) {
        UIkit.notify({
            message : msg,
            status  : status || 'success',
            timeout : time || 2000,
            pos     : pos || 'top-center'
        });
    }
});