angular
    .module("App")
    .controller("adminSettingCtrl", adminSettingCtrl);
adminSettingCtrl.$inject = ['$scope', '$localStorage', 'uikitService', 'parseService', 'customService'];
function adminSettingCtrl($scope, $localStorage, uikitService, parseService, customService) {
    console.log('adminSettingCtrl')

    // ##########################################################
    // ##########################################################
    // INITIALIZATION
    // ##########################################################
    // ##########################################################

    // Models
    $scope.loader = { isSaving: false };
    $scope.data = {};
    $scope.submitEnter = customService.enterEvent;

    // Local
    var currentUser = parseService.getCurrentUser();
    $scope.data.username = currentUser.get('username');
    $scope.data.lastname = currentUser.get('lastname');
    $scope.data.firstname = currentUser.get('firstname');
    $scope.data.middlename = currentUser.get('middlename');



    // ##########################################################
    // ##########################################################
    // USER ACTIONS
    // ##########################################################
    // ##########################################################

    $scope.save = function() {
        if ($scope.data.newPassword && $scope.data.retypePassword) {
            if ($scope.data.newPassword != $scope.data.retypePassword) {
                uikitService.notification('Password mismatch', 'danger');
            } else if ($scope.data.oldPassword != $localStorage.ocmWebsite.user.password) {
                uikitService.notification('Incorrect old password', 'danger');
            } else {
                saveContinue();
            }
        } else {
            saveContinue();
        }
    };

    function saveContinue () {
        $scope.loader.isSaving = true;

        if ($scope.data.newPassword && $scope.data.retypePassword)
            currentUser.set('password', $scope.data.newPassword);

        currentUser.set('lastname', $scope.data.lastname);
        currentUser.set('firstname', $scope.data.firstname);
        currentUser.set('middlename', $scope.data.middlename);
        currentUser.save().then(function() {
            if ($scope.data.newPassword && $scope.data.retypePassword) {
                console.log('relogin')
                // Relogin the user
                Parse.User.logIn($scope.data.username, $scope.data.newPassword, {
                    success: function(user) {
                        uikitService.notification('Account updated');
                        $localStorage.ocmWebsite.user.password = $scope.data.newPassword;
                        $scope.data = {};
                        $scope.data.username = currentUser.get('username');
                        $scope.data.lastname = currentUser.get('lastname');
                        $scope.data.firstname = currentUser.get('firstname');
                        $scope.data.middlename = currentUser.get('middlename');
                        $scope.loader.isSaving = false;
                        $scope.$apply();
                    },
                    error: function(error) {
                        console.log("Error: " + error.code + " " + error.message);
                        uikitService.notification(error.message, 'danger');
                        $scope.loader.isSaving = false;
                        $scope.$apply();
                    }
                });
            } else {
                uikitService.notification('Account updated');
                $scope.data = {};
                $scope.data.username = currentUser.get('username');
                $scope.data.lastname = currentUser.get('lastname');
                $scope.data.firstname = currentUser.get('firstname');
                $scope.data.middlename = currentUser.get('middlename');
                $scope.loader.isSaving = false;
                $scope.$apply();
            }
        });
    }

}