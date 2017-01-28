angular
    .module("App")
    .controller("adminBranchAccountCtrl", adminBranchAccountCtrl);
adminBranchAccountCtrl.$inject = ['$scope', '$timeout', '$stateParams', '$localStorage', 'uikitService', 'customService', 'branches'];
function adminBranchAccountCtrl($scope, $timeout, $stateParams, $localStorage, uikitService, customService, branches) {
    console.log('adminBranchAccountCtrl')

    // ##########################################################
    // ##########################################################
    // INITIALIZATION
    // ##########################################################
    // ##########################################################

    // Models
    $scope.loader = { isSaving: false };
    $scope.data = {};
    $scope.submitEnter = customService.enterEvent;
    $scope.branches = branches;
    $scope.selectedBranchId = '';
    $scope.selectedBranchUser = {};
    $scope.adminPassword = '';

    // Local
    var selectedBranchObject = {};


    // ##########################################################
    // ##########################################################
    // GETTERS
    // ##########################################################
    // ##########################################################

    if ($stateParams && $stateParams.id) {
        $scope.selectedBranchId = $stateParams.id;
        branchChanged();
    }



    // ##########################################################
    // ##########################################################
    // CONTROLLER FUNCTIONS
    // ##########################################################
    // ##########################################################

    function branchChanged() {
        for (var i = 0; i < branches.length; i++) {
            if ($scope.selectedBranchId == branches[i].id) {
                selectedBranchObject = branches[i];
                break;
            }
        }

        $scope.selectedBranchUser = selectedBranchObject.get('userPointer');
        $scope.data.username = $scope.selectedBranchUser.get('username');
    }

    $scope.selectedBranchChanged = function() {
        branchChanged();
    };



    // ##########################################################
    // ##########################################################
    // USER ACTIONS
    // ##########################################################
    // ##########################################################

    $scope.save = function() {
        if ($scope.data.newPassword != $scope.data.retypePassword) {
            uikitService.notification('Password mismatch', 'danger');
        } else {
            UIkit.modal('#admnpass').show();
        }
    };

    $scope.saveNext = function() {
        if (!$scope.adminPassword) {
            uikitService.notification('Admin password required', 'danger');
        } else if ($scope.adminPassword != $localStorage.ocmWebsite.user.password) {
            uikitService.notification('Incorrect admin password', 'danger');
        } else {

            var userId = $scope.selectedBranchUser.id;
            var password = $scope.data.newPassword;

            $scope.loader.isSaving = true;
            Parse.Cloud.run('updateBranchUser', { userId: userId, password: password }).then(function(response) {
                uikitService.notification('Update success');
                $scope.data.newPassword = '';
                $scope.data.retypePassword = '';
                $scope.loader.isSaving = false;
                $scope.$apply();
                UIkit.modal('#admnpass').hide();
            }, function(error) {
                console.log('updateBranchUser', error)
                uikitService.notification(error.message, 'danger');
                $scope.loader.isSaving = false;
                $scope.$apply();
            });
        }
    };

}