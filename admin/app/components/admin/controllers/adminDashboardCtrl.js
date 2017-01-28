angular
    .module("App")
    .controller("adminDashboardCtrl", adminDashboardCtrl);
adminDashboardCtrl.$inject = ['$scope', '$localStorage', '$state', 'uikitService', 'customService', 'branches'];
function adminDashboardCtrl($scope, $localStorage, $state, uikitService, customService, branches) {
    console.log('adminDashboardCtrl')

    // ##########################################################
    // ##########################################################
    // INITIALIZATION
    // ##########################################################
    // ##########################################################

    // Models
    $scope.loader = { isLoadingData: false, isUpdating: false };
    $scope.branches = branches;
    $scope.selectedEditQuota = {}, $scope.selectedEvaluate = {};
    $scope.quota = '';
    $scope.count = { clients: 0, inquires: 0, transactions: 0 };

    // Local


    // ##########################################################
    // ##########################################################
    // GETTERS
    // ##########################################################
    // ##########################################################



    // ##########################################################
    // ##########################################################
    // CONTROLLER FUNCTIONS
    // ##########################################################
    // ##########################################################

    $scope.editBranch = function(data) {
        $state.transitionTo('admin-branch-account', { id: data.id });
    };

    $scope.monitor = function(data) {
        $state.transitionTo('admin-branch-database', { id: data.id });
    };

    $scope.setEditQuota = function(data) {
        $scope.selectedEditQuota = data;
        $scope.quota = data.get('quota');
    };

    $scope.setEvaluate = function(data) {
        $scope.loader.isLoadingData = true;
        $scope.selectedEvaluate = data;
        var counter = 0;

        // get clients
        var Client = Parse.Object.extend("Client");
        var client = new Parse.Query(Client);
        client.equalTo("branchPointer", data);
        client.find({
            success: function(results) {
                counter++;
                $scope.count.clients = results.length;
                evaluationDone(counter);
            },
            error: function(error) {
                console.log('Parse.Query(Clients)', error)
                uikitService.notification(error.message, 'danger');
                $scope.loader.isLoadingData = false;
                $scope.$apply();
            }
        });

        // get inquires
        var Inquire = Parse.Object.extend("Inquire");
        var inquire = new Parse.Query(Inquire);
        inquire.equalTo("branchPointer", data);
        inquire.find({
            success: function(results) {
                counter++;
                $scope.count.inquires = results.length;
                evaluationDone(counter);
            },
            error: function(error) {
                console.log('Parse.Query(Inquires)', error)
                uikitService.notification(error.message, 'danger');
                $scope.loader.isLoadingData = false;
                $scope.$apply();
            }
        });

        // get transactions
        var Transaction = Parse.Object.extend("Transaction");
        var transaction = new Parse.Query(Transaction);
        transaction.equalTo("branchPointer", data);
        transaction.find({
            success: function(results) {
                counter++;
                $scope.count.transactions = results.length;
                evaluationDone(counter);
            },
            error: function(error) {
                console.log('Parse.Query(Transactions)', error)
                uikitService.notification(error.message, 'danger');
                $scope.loader.isLoadingData = false;
                $scope.$apply();
            }
        });

    };
    function evaluationDone(counter) {
        if (counter == 3) {
            $scope.loader.isLoadingData = false;
            $scope.$apply();
        }
    }



    // ##########################################################
    // ##########################################################
    // USER ACTIONS
    // ##########################################################
    // ##########################################################

    $scope.save = function() {
        if (!$scope.quota) {
            uikitService.notification('Quota required', 'danger');
        } else {

            $scope.loader.isUpdating = true;
            Parse.Cloud.run('updateBranchQuota', { id: $scope.selectedEditQuota.id, quota: $scope.quota }).then(function(response) {
                uikitService.notification('Update success');
                $state.reload();
            }, function(error) {
                console.log('updateBranchQuota', error)
                uikitService.notification(error.message, 'danger');
                $scope.loader.isUpdating = false;
                $scope.$apply();
            });

        }
    };

}