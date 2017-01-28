angular
    .module("App")
    .controller("branchInquireCtrl", branchInquireCtrl);
branchInquireCtrl.$inject = ['$scope', '$timeout', '$state', 'uikitService', 'customService', 'branch', 'inquires'];
function branchInquireCtrl($scope, $timeout, $state, uikitService, customService, branch, inquires) {
    console.log('branchInquireCtrl')

    // ##########################################################
    // ##########################################################
    // INITIALIZATION
    // ##########################################################
    // ##########################################################

    // Models
    $scope.loader = { isAdding: false, isDeleting: false };
    $scope.branch = branch;
    $scope.inquires = inquires;
    $scope.selectedAdd = {}, $scope.selectedDelete = {};

    // Pagination
    $scope.currentPage = 1;
    $scope.pageSize = 10;



    // ##########################################################
    // ##########################################################
    // CONTROLLER FUNCTIONS
    // ##########################################################
    // ##########################################################

    $scope.setAdd = function(data) {
        $scope.selectedAdd = data;
    };

    $scope.setDelete = function(data) {
        $scope.selectedDelete = data;
    };

    $scope.filterSearch = function (q) {
        if ($scope.searchKeyword) {
            if (
                q.get('firstname').toLowerCase().indexOf($scope.searchKeyword) > -1 ||
                q.get('middlename').toLowerCase().indexOf($scope.searchKeyword) > -1 ||
                q.get('lastname').toLowerCase().indexOf($scope.searchKeyword) > -1 ||
                q.get('email').toLowerCase().indexOf($scope.searchKeyword) > -1
            )
                return true;
        } else {
            return true;
        }
    };



    // ##########################################################
    // ##########################################################
    // USER ACTIONS
    // ##########################################################
    // ##########################################################

    $scope.add = function() {
        $scope.loader.isAdding = true;
        Parse.Cloud.run('deleteInquireAddClient', { id: $scope.selectedAdd.id }).then(function(response) {
            uikitService.notification('Add success');
            $state.reload();
        }, function(error) {
            console.log('deleteInquireAddClient error', error)
            uikitService.notification(error.message, 'danger');
            $scope.loader.isAdding = false;
            $scope.$apply();
        });
    };

    $scope.delete = function() {
        $scope.loader.isDeleting = true;
        Parse.Cloud.run('deleteInquire', { id: $scope.selectedDelete.id }).then(function(response) {
            uikitService.notification('Delete success');
            $state.reload();
        }, function(error) {
            console.log('deleteInquire error', error)
            uikitService.notification(error.message, 'danger');
            $scope.loader.isDeleting = false;
            $scope.$apply();
        });
    };

}