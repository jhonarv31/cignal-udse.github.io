angular
    .module("App")
    .controller("loginCtrl", loginCtrl);
loginCtrl.$inject = ['$scope', '$localStorage', '$state', 'uikitService'];
function loginCtrl($scope, $localStorage, $state, uikitService) {
    console.log('loginCtrl')

    // ##########################################################
    // ##########################################################
    // INITIALIZATION
    // ##########################################################
    // ##########################################################

    // Models
    $scope.loader = { isLoggingIn: false };
    $scope.user = {};
    $scope.keepMeLoggedIn = false;

    if ($localStorage.ocmWebsite.keepMeLoggedIn) {
        $scope.keepMeLoggedIn = true;
        $scope.user.username = $localStorage.ocmWebsite.user.username;
        $scope.user.password = $localStorage.ocmWebsite.user.password;
    }



    // ##########################################################
    // ##########################################################
    // USER ACTIONS
    // ##########################################################
    // ##########################################################

    $scope.checkboxChanged = function() {
        if (!$scope.keepMeLoggedIn) {
            $localStorage.ocmWebsite.keepMeLoggedIn = false;
            $localStorage.ocmWebsite.user.email = '';
            $localStorage.ocmWebsite.user.password = '';
        }
    };

    $scope.login = function() {
        $scope.loader.isLoggingIn = true;

        Parse.User.logIn($scope.user.username, $scope.user.password, {
            success: function(user) {
                var type = user.get('type');
                if (type == 'ADMIN') {
                    setLocalStorage();
                    uikitService.notification('Admin login success');
                    $state.transitionTo('admin-dashboard');
                } else if (type == 'BRANCH') {
                    setLocalStorage();
                    uikitService.notification('Branch login success');
                    $state.transitionTo('branch-home');
                } else {
                    Parse.User.logOut().then(function() {
                        uikitService.notification('Unauthorized account', 'danger');
                        $scope.loader.isLoggingIn = false;
                        $scope.$apply();
                        $('#password').focus();
                        $('#password').select();
                    });
                }
            },
            error: function(user, error) {
                console.log("Error: " + error.code + " " + error.message);
                uikitService.notification(error.message, 'danger');
                $scope.loader.isLoggingIn = false;
                $scope.$apply();
                $('#password').focus();
                $('#password').select();
            }
        });
    };

    function setLocalStorage() {
        $localStorage.ocmWebsite.user = {
            username: $scope.user.username,
            password: $scope.user.password
        };

        if ($scope.keepMeLoggedIn) {
            $localStorage.ocmWebsite.keepMeLoggedIn = true;
        }
    }

}