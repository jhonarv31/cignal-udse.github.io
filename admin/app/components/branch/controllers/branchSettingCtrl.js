angular
    .module("App")
    .controller("branchSettingCtrl", branchSettingCtrl);
branchSettingCtrl.$inject = ['$scope', '$localStorage', 'uikitService', 'parseService', 'customService', 'branch'];
function branchSettingCtrl($scope, $localStorage, uikitService, parseService, customService, branch) {
    console.log('branchSettingCtrl')

    // ##########################################################
    // ##########################################################
    // INITIALIZATION
    // ##########################################################
    // ##########################################################

    // Models
    $scope.loader = { isSaving: false };
    $scope.branch = branch;
    $scope.branchModel = {
        firstname: branch.get('firstname'),
        middlename: branch.get('middlename'),
        lastname: branch.get('lastname')
    };
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
        if (
            $scope.branchModel.firstname !== branch.get('firstname') ||
            $scope.branchModel.middlename !== branch.get('middlename') ||
            $scope.branchModel.lastname !== branch.get('lastname')
        ) {
            $scope.loader.isSaving = true;

            console.log('branch setting')

            branch.set('firstname', $scope.branchModel.firstname);
            branch.set('middlename', $scope.branchModel.middlename);
            branch.set('lastname', $scope.branchModel.lastname);
            branch.save().then(function() {
                uikitService.notification('Branch account updated');
                $scope.loader.isSaving = false;
                $scope.$apply();
            });
        }


        if ($scope.data.newPassword && $scope.data.retypePassword) {
            if ($scope.data.newPassword != $scope.data.retypePassword) {
                uikitService.notification('Password mismatch', 'danger');
            } else if ($scope.data.oldPassword != $localStorage.ocmWebsite.user.password) {
                uikitService.notification('Incorrect old password', 'danger');
            } else {
                $scope.loader.isSaving = true;

                currentUser.set('password', $scope.data.newPassword);
                currentUser.save().then(function() {
                    // Relogin the user
                    Parse.User.logIn($scope.data.username, $scope.data.newPassword, {
                        success: function(user) {
                            uikitService.notification('Branch account updated');
                            $localStorage.ocmWebsite.user.password = $scope.data.newPassword;
                            $scope.data = {};
                            $scope.data.username = currentUser.get('username');
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
                });

            }
        }
    };

}