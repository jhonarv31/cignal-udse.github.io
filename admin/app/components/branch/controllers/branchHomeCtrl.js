angular
    .module("App")
    .controller("branchHomeCtrl", branchHomeCtrl);
branchHomeCtrl.$inject = ['$scope', '$timeout', '$state', '$q', 'uikitService', 'customService', 'branch', 'clients', 'inquires'];
function branchHomeCtrl($scope, $timeout, $state, $q, uikitService, customService, branch, clients, inquires) {
    console.log('branchHomeCtrl')

    // ##########################################################
    // ##########################################################
    // INITIALIZATION
    // ##########################################################
    // ##########################################################

    // Models
    $scope.loader = { isLoadingData: true };
    $scope.branch = branch, $scope.clients = clients, $scope.inquires = inquires;
    $scope.newData = {};
    $scope.newData.branchPointer = { __type: "Pointer", className: "Branch", objectId: branch.id };
    $scope.newData.registration = 'WALK IN';
    $scope.submitEnter = customService.enterEvent;
    $scope.selectedCheckbox = [];
    $scope.othersTxt = '';
    $scope.isInquireChecked, $scope.isOthersChecked;

    // Local
    var checkboxData = ['INQUIRE', 'INSTALL/NEW ACCOUNT', 'ADD BOX', 'RELOCATION', 'REPAIR','OTHERS'];
    var branchPointer = { __type: "Pointer", className: "Branch", objectId: branch.id };

    getOnlineReservations();



    // ##########################################################
    // ##########################################################
    // GETTERS
    // ##########################################################
    // ##########################################################

    function getOnlineReservations() {
        $q.all([

            Parse.Cloud.run('getPreregistrations', { branchPointer: branchPointer }).then(function(response) {
                $scope.preregistrations = response;
            }, function(error) {
                console.log('getPreregistrations', error)
                uikitService.notification(error.message, 'danger');
                $scope.loader.isLoadingData = false;
                $scope.$apply();
            }),

            Parse.Cloud.run('getReservations', { branchPointer: branchPointer, status: "PENDING" }).then(function(response) {
                $scope.reservations = response;
            }, function(error) {
                console.log('getReservations', error)
                uikitService.notification(error.message, 'danger');
                $scope.loader.isLoadingData = false;
                $scope.$apply();
            }),

            Parse.Cloud.run('getCustomerServices', { }).then(function(response) {
                $scope.customerservices = response;
            }, function(error) {
                console.log('getCustomerServices', error)
                uikitService.notification(error.message, 'danger');
                $scope.loader.isLoadingData = false;
                $scope.$apply();
            })
        ]).then(function() {
            console.log('$q all done')
            $scope.loader.isLoadingData = false;
        }, function(err) {
            console.log('$q all err', err);
        });
    }

    function getPreregistrations() {
        Parse.Cloud.run('getPreregistrations', { branchPointer: branchPointer }).then(function(response) {
            $scope.preregistrations = response;
        }, function(error) {
            console.log('getPreregistrations', error)
            uikitService.notification(error.message, 'danger');
            $scope.loader.isLoadingData = false;
            $scope.$apply();
        });
    }

    function getReservations() {
        Parse.Cloud.run('getReservations', { branchPointer: branchPointer, status: "PENDING" }).then(function(response) {
            $scope.reservations = response;
        }, function(error) {
            console.log('getReservations', error)
            uikitService.notification(error.message, 'danger');
            $scope.loader.isLoadingData = false;
            $scope.$apply();
        });
    }

    function getCustomerServices() {
        Parse.Cloud.run('getCustomerServices', { }).then(function(response) {
            $scope.customerservices = response;
        }, function(error) {
            console.log('getCustomerServices', error)
            uikitService.notification(error.message, 'danger');
            $scope.loader.isLoadingData = false;
            $scope.$apply();
        });
    }



    // ##########################################################
    // ##########################################################
    // CONTROLLER FUNCTIONS
    // ##########################################################
    // ##########################################################

    function isDateValid (date) {
        var today = new Date();
        today.setHours(0,0,0,0);
        date.setHours(0,0,0,0);

        return date >= today;
    }



    // ##########################################################
    // ##########################################################
    // USER ACTIONS
    // ##########################################################
    // ##########################################################

    $scope.add = function() {
        if (!$scope.selectedCheckbox.length) {
            uikitService.notification('Service type required', 'danger');
        } else if ($scope.selectedCheckbox.indexOf(0) > -1 && $scope.selectedCheckbox.length > 1) {
            uikitService.notification('You can only select "INQUIRE" alone or pick other service/s aside from INQUIRE', 'danger');
        } else if ($scope.selectedCheckbox.indexOf(5) > -1 && !$scope.othersTxt) {
            uikitService.notification('Please specify "OTHERS"', 'danger');
        } else if (!isDateValid($scope.newData.date)) {
            uikitService.notification('Invalid date', 'danger');
        } else {
            // generate type text
            var typeArr = [];
            $scope.selectedCheckbox.sort(function (a, b) { return a - b; });
            for (var i = 0; i < $scope.selectedCheckbox.length; i++) {
                var currentValue = $scope.selectedCheckbox[i];
                if (currentValue !== 5)
                    typeArr.push(checkboxData[currentValue]);
                else
                    typeArr.push($scope.othersTxt);
            }

            $scope.newData.type = typeArr.join(', ');

            if ($scope.isInquireChecked) {
                $scope.newData.plan = '';
                $scope.newData.amount = '';
                $scope.newData.ar = '';
            }

            addNext();
        }
    };

    function addNext () {
        $scope.loader.isSaving = true;

        Parse.Cloud.run('addNewInquire', { data: $scope.newData }).then(function(response) {
            uikitService.notification('Add success');
            $state.reload();
        }, function(error) {
            console.log('addNewInquire', error)
            uikitService.notification(error.message, 'danger');
            $scope.loader.isSaving = false;
            $scope.$apply();
        });
    }

    $scope.toggleCheckbox = function (value) {
        var index = $scope.selectedCheckbox.indexOf(value);

        if (index > -1)
            $scope.selectedCheckbox.splice(index, 1);
        else
            $scope.selectedCheckbox.push(value);

        if (value === 5)
            $scope.othersTxt = '';

        if (value === 0)
            $scope.isInquireChecked = !$scope.isInquireChecked;

        if ($scope.selectedCheckbox.length && $scope.selectedCheckbox.indexOf(0) === -1)
            $scope.isOthersChecked = true;
        else
            $scope.isOthersChecked = false;
    };

}