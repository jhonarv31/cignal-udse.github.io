angular
    .module("App")
    .controller("adminBranchDatabaseCtrl", adminBranchDatabaseCtrl);
adminBranchDatabaseCtrl.$inject = ['$scope', '$localStorage', '$state', '$timeout', '$interval', '$stateParams', 'uikitService', 'customService', 'branches', 'ClientsService'];
function adminBranchDatabaseCtrl($scope, $localStorage, $state, $timeout, $interval, $stateParams, uikitService, customService, branches, ClientsService) {
    console.log('adminBranchDatabaseCtrl')

    // ##########################################################
    // ##########################################################
    // INITIALIZATION
    // ##########################################################
    // ##########################################################

    // Models
    $scope.loader = { isLoadingData: false };
    $scope.database = [];
    $scope.branches = branches;
    $scope.selectedBranchId = '';
    $scope.selectedView = null;
    $scope.isAllSelected = false, $scope.isIndividualSelected = false;
    $scope.hasStartedSearching = false;

    // Pagination
    $scope.currentPage = 1;
    $scope.pageSize = 5;
    $scope.currentPage2 = 1;
    $scope.pageSize2 = 5;
    $scope.currentPageTransaction = 1;
    $scope.pageSizeTransaction = 5;



    // ##########################################################
    // ##########################################################
    // GETTERS
    // ##########################################################
    // ##########################################################

    if ($stateParams && $stateParams.id) {
        $timeout(function() {
            $scope.selectedBranchId = $stateParams.id;
            $scope.load();
        }, 100);
    }



    // ##########################################################
    // ##########################################################
    // CONTROLLER FUNCTIONS
    // ##########################################################
    // ##########################################################

    $scope.formatDate = function(data) {
        return customService.dateFormat1(data);
    };

    $scope.setView = function(data) {
        $scope.selectedView = data;
        $scope.currentPageTransaction = 1;
    };

    function getBranchTransactions() {
        var branchPointer = { __type: "Pointer", className: "Branch", objectId: $scope.selectedBranchId };

        var Transaction = Parse.Object.extend("Transaction");
        var query = new Parse.Query(Transaction);
        query.equalTo("branchPointer", branchPointer);
        query.descending('updatedAt');
        query.find({
            success: function(results) {
                $scope.database = results;
                $scope.loader.isLoadingData = false;
                $scope.$apply();
            },
            error: function(error) {
                console.log('Parse.Query(Transaction) error', error)
                uikitService.notification(error.message, 'danger');
                $scope.loader.isLoadingData = false;
                $scope.$apply();
            }
        });
    }

    function getBranchClients() {
        var branchPointer = { __type: "Pointer", className: "Branch", objectId: $scope.selectedBranchId };

        ClientsService.getClients(branchPointer).then(function(response) {
            $scope.database = response;

            if (!response.length)
                $scope.loader.isLoadingData = false;

            // get transactions of each clients
            var counter = 0;
            for (var i = 0; i < response.length; i++) {
                (function(i) {
                    var Transaction = Parse.Object.extend("Transaction");
                    var query = new Parse.Query(Transaction);
                    query.equalTo("clientPointer", response[i]);
                    query.descending('updatedAt');
                    query.find({
                        success: function(results) {
                            $scope.database[i].transactions = results;
                            counter++;
                            if (counter == response.length) {
                                $scope.loader.isLoadingData = false;
                                $scope.$apply();
                                console.log($scope.database)
                            }
                        },
                        error: function(error) {
                            console.log('Parse.Query(Transaction) error', error)
                            uikitService.notification(error.message, 'danger');
                            $scope.loader.isLoadingData = false;
                            $scope.$apply();
                        }
                    });
                }(i));
            }

        }, function(error) {
            console.log('ClientsService.getClients error', error)
            uikitService.notification(error.message, 'danger');
            $scope.loader.isLoadingData = false;
            $scope.$apply();
        });
    }

    function getAll() {
        Parse.Cloud.run('getAllBranchData', { }).then(function(response) {
            $scope.database = response;
            $scope.loader.isLoadingData = false;
            $scope.$apply();
        }, function(error) {
            console.log('getAllBranchData error', error)
            uikitService.notification(error.message, 'danger');
            $scope.loader.isLoadingData = false;
            $scope.$apply();
        });
    }

    function createCSV(columns, rows) {
        columns = columns.join(',');
        rows = rows.join('\n');

        var csvContent = "data:text/csv;charset=utf-8,";
        csvContent += columns + '\n';
        csvContent += rows;

        var data, filename, link;
        data = encodeURI(csvContent);
        filename = 'All Branches Monitoring - ' + customService.dateFormat2(new Date());

        link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('download', filename + '.csv');
        link.click();
    }



    // ##########################################################
    // ##########################################################
    // USER ACTIONS
    // ##########################################################
    // ##########################################################

    $scope.load = function() {
        $scope.currentPage = 1;

        $scope.hasStartedSearching = true;
        $scope.isAllSelected = false;
        $scope.isIndividualSelected = false;
        $scope.loader.isLoadingData = true;

        if ($scope.selectedBranchId == 'All') {
            $scope.isAllSelected = true;
            getAll();
        } else {
            $scope.isIndividualSelected = true;
            //getBranchTransactions();
            getBranchClients();
        }
    };

    $scope.download = function() {
        var columns = ['Branch Name', 'Number of Clients', 'Number of Inquires', 'Number of Pending Pre-Registration', 'Number of Reservations'];
        var data = [];

        for (var i = 0; i < $scope.database.length; i++) {
            var currentData = $scope.database[i];
            var temp = [];
            temp.push(currentData.branch.get('name'));
            temp.push(currentData.clients.length);
            temp.push(currentData.inquires.length);
            temp.push(currentData.users.length);
            temp.push(currentData.reservations.length);

            data.push(temp.join(','));
        }

        createCSV(columns, data);
    };

    $scope.view = function(data) {
        $scope.selectedBranchId = data.branch.id;
        $scope.load();
    };

}