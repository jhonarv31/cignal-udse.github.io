angular
    .module("App")
    .controller("adminBranchBranchesCtrl", adminBranchBranchesCtrl);
adminBranchBranchesCtrl.$inject = ['$scope', '$localStorage', '$state', 'uikitService', 'customService', 'branches'];
function adminBranchBranchesCtrl($scope, $localStorage, $state, uikitService, customService, branches) {
    console.log('adminBranchBranchesCtrl')

    // ##########################################################
    // ##########################################################
    // INITIALIZATION
    // ##########################################################
    // ##########################################################

    // Models
    $scope.loader = { isLoadingData: false, isAdding: false, isDeleting: false };
    $scope.branches = branches;
    $scope.newData = {};
    $scope.selectedDelete = {};
    $scope.adminPassword = '', $scope.adminPassword2 = '';
    $scope.submitEnter = customService.enterEvent;

    // Pagination
    $scope.currentPage = 1;
    $scope.pageSize = 10;



    // ##########################################################
    // ##########################################################
    // CONTROLLER FUNCTIONS
    // ##########################################################
    // ##########################################################

    $scope.setDelete = function(data) {
        $scope.selectedDelete = data;
    };



    // ##########################################################
    // ##########################################################
    // USER ACTIONS
    // ##########################################################
    // ##########################################################

    $scope.add = function() {
        if (!$scope.newData.name) {
            uikitService.notification('Branch name required', 'danger');
        } else if (!$scope.newData.location) {
            uikitService.notification('Location required', 'danger');
        } else if (!$scope.newData.lastname) {
            uikitService.notification('Last name required', 'danger');
        } else if (!$scope.newData.firstname) {
            uikitService.notification('First name required', 'danger');
        } else if (!$scope.newData.contact) {
            uikitService.notification('Contact number required', 'danger');
        } else if (!$scope.newData.email) {
            uikitService.notification('Email address required', 'danger');
        } else if (!$scope.newData.username) {
            uikitService.notification('Login ID required', 'danger');
        } else if (!$scope.newData.password) {
            uikitService.notification('Password required', 'danger');
        } else if (!$scope.newData.retypePassword) {
            uikitService.notification('Retype password required', 'danger');
        } else if ($scope.newData.password != $scope.newData.retypePassword) {
            uikitService.notification('Password mismatch', 'danger');
        } else {
            var dataExists = false;
            for (var i in $scope.branches) {
                if ($scope.branches[i].get('name').toLowerCase() == $scope.newData.name.toLowerCase()) {
                    dataExists = true;
                    break;
                }
            }

            if (dataExists) {
                uikitService.notification('Branch already exists', 'danger');
            } else {
                UIkit.modal('#admnpass').show();
            }
        }
    };

    $scope.addNext = function() {
        if (!$scope.adminPassword) {
            uikitService.notification('Admin password required', 'danger');
        } else if ($scope.adminPassword != $localStorage.ocmWebsite.user.password) {
            uikitService.notification('Incorrect admin password', 'danger');
        } else {
            var account = {
                username: $scope.newData.username,
                password: $scope.newData.password
            };

            var data = {
                name: $scope.newData.name,
                location: $scope.newData.location,
                lastname: $scope.newData.lastname,
                firstname: $scope.newData.firstname,
                middlename: $scope.newData.middlename,
                contact: $scope.newData.contact
            };

            $scope.loader.isAdding = true;
            Parse.Cloud.run('addNewBranch', { account: account, data: data }).then(function(response) {
                uikitService.notification('Add success');
                $state.reload();
            }, function(error) {
                console.log('addNewBranch', error)
                uikitService.notification(error.message, 'danger');
                $scope.loader.isAdding = false;
                $scope.$apply();
            });
        }
    };

    $scope.delete = function() {
        if (!$scope.adminPassword2) {
            uikitService.notification('Admin password required', 'danger');
        } else if ($scope.adminPassword2 != $localStorage.ocmWebsite.user.password) {
            uikitService.notification('Incorrect admin password', 'danger');
        } else {
            $scope.loader.isDeleting = true;
            Parse.Cloud.run('deleteBranch', { id: $scope.selectedDelete.id }).then(function(response) {
                uikitService.notification('Delete success');
                $state.reload();
            }, function(error) {
                console.log('deleteBranch error', error)
                uikitService.notification(error.message, 'danger');
                $scope.loader.isDeleting = false;
                $scope.$apply();
            });
        }
    };

}