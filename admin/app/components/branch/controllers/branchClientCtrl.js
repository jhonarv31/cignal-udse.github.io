angular
    .module("App")
    .controller("branchClientCtrl", branchClientCtrl);
branchClientCtrl.$inject = ['$scope', '$timeout', '$state', 'uikitService', 'customService', 'branch', 'clients'];
function branchClientCtrl($scope, $timeout, $state, uikitService, customService, branch, clients) {
    console.log('branchClientCtrl')

    // ##########################################################
    // ##########################################################
    // INITIALIZATION
    // ##########################################################
    // ##########################################################

    // Models
    $scope.loader = { isLoadingData: true, isSaving: false };
    $scope.branch = branch;
    $scope.clients = clients;
    $scope.selectedAdd = {}, $scope.selectedView = {};
    $scope.newData = {};
    $scope.submitEnter = customService.enterEvent;
    $scope.selectedCheckbox = [];

    // Pagination
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.currentPageTransaction = 1;
    $scope.pageSizeTransaction = 5;

    // Local
    var checkboxData = ['INSTALL/NEW ACCOUNT', 'ADD BOX', 'RELOCATION', 'REPAIR','OTHERS'];



    // ##########################################################
    // ##########################################################
    // GETTERS
    // ##########################################################
    // ##########################################################

    // get transactions of each clients
    var counter = 0;
    for (var i = 0; i < clients.length; i++) {
        (function(i) {
            var Transaction = Parse.Object.extend("Transaction");
            var query = new Parse.Query(Transaction);
            query.equalTo("clientPointer", clients[i]);
            query.descending("createdAt");
            query.find({
                success: function(results) {
                    $scope.clients[i].transactions = results;
                    counter++;
                    if (counter == clients.length) {
                        $scope.loader.isLoadingData = false;
                        $scope.$apply();
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



    // ##########################################################
    // ##########################################################
    // CONTROLLER FUNCTIONS
    // ##########################################################
    // ##########################################################

    $scope.formatDate = function(data) {
        return customService.dateFormat1(data);
    };

    $scope.setAdd = function(data) {
        $scope.selectedAdd = data;
    };
    $scope.setView = function(data) {
        $scope.selectedView = data;
        $scope.currentPageTransaction = 1;
    };

    $scope.serviceTypeChanged = function() {
        $scope.newData.plan = '';
        $scope.newData.postpaid = '';

        if ($scope.newData.type == 'INSTALL')
            $('#Install').removeClass('uk-hidden');
        else
            $('#Install').addClass('uk-hidden');
    };
    $scope.planChanged = function() {
        $scope.newData.postpaid = '';

        if ($scope.newData.plan == 'POSTPAID')
            $('#Postpaid').removeClass('uk-hidden');
        else
            $('#Postpaid').addClass('uk-hidden');
    };

    function createCSV(columns, rows) {
        columns = columns.join(',');
        rows = rows.join('\n');

        var csvContent = "data:text/csv;charset=utf-8,";
        csvContent += columns + '\n';
        csvContent += rows;

        var data, filename, link;
        data = encodeURI(csvContent);
        filename = $scope.selectedView.get('name') + '\'s transactions - ' + customService.dateFormat2(new Date());

        link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('download', filename + '.csv');
        link.click();
    }

    $scope.toggleCheckbox = function (value) {
        var index = $scope.selectedCheckbox.indexOf(value);

        if (index > -1)
            $scope.selectedCheckbox.splice(index, 1);
        else
            $scope.selectedCheckbox.push(value);

        if (value === 4)
            $scope.othersTxt = '';
    };

    function isDateValid (date) {
        var today = new Date();
        today.setHours(0,0,0,0);
        date.setHours(0,0,0,0);

        return date >= today;
    }

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
        if (!$scope.selectedCheckbox.length) {
            uikitService.notification('Service type required', 'danger');
        } else if (!isDateValid($scope.newData.date)) {
            uikitService.notification('Invalid date', 'danger');
        } else {
            $scope.loader.isSaving = true;
            $scope.newData.clientPointer = { __type: "Pointer", className: "Client", objectId: $scope.selectedAdd.id };
            $scope.newData.branchPointer = { __type: "Pointer", className: "Branch", objectId: branch.id };

            // generate type text
            var typeArr = [];
            $scope.selectedCheckbox.sort(function (a, b) { return a - b; });
            for (var i = 0; i < $scope.selectedCheckbox.length; i++) {
                var currentValue = $scope.selectedCheckbox[i];
                if (currentValue !== 4)
                    typeArr.push(checkboxData[currentValue]);
                else
                    typeArr.push($scope.othersTxt);
            }

            $scope.newData.type = typeArr.join(', ');

            Parse.Cloud.run('addNewTransaction', { data: $scope.newData }).then(function(response) {
                uikitService.notification('Add success');
                $state.reload();
            }, function(error) {
                console.log('addNewTransaction', error)
                uikitService.notification(error.message, 'danger');
                $scope.loader.isSaving = false;
                $scope.$apply();
            });
        }
    };

    $scope.download = function() {
        var columns = ['Service Type', 'Plan', 'Amount', 'Date', 'Receipt Number', 'Remarks'];
        var data = [];

        for (var i = 0; i < $scope.selectedView.transactions.length; i++) {
            var currentData = $scope.selectedView.transactions[i];
            var temp = [];
            temp.push(currentData.get('type'));

            if (currentData.get('postpaid'))
                temp.push(currentData.get('postpaid'));
            else if (currentData.get('plan'))
                temp.push(currentData.get('plan'));
            else
                temp.push('N/A');

            if (currentData.get('amount'))
                temp.push(currentData.get('amount'));
            else
                temp.push('N/A');

            temp.push($scope.formatDate(currentData.get('date')));

            if (currentData.get('ar'))
                temp.push('AR' + currentData.get('ar'));
            else
                temp.push('N/A');

            if (currentData.get('remarks'))
                temp.push(currentData.get('remarks'));
            else
                temp.push('N/A');

            data.push(temp.join(','));
        }

        createCSV(columns, data);
    };

}