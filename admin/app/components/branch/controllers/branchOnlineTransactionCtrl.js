angular
    .module("App")
    .controller("branchOnlineTransactionCtrl", branchOnlineTransactionCtrl);
branchOnlineTransactionCtrl.$inject = ['$scope', '$timeout', '$state', 'customService', 'uikitService', 'branch'];
function branchOnlineTransactionCtrl($scope, $timeout, $state, customService, uikitService, branch) {
    console.log('branchOnlineTransactionCtrl')

    // ##########################################################
    // ##########################################################
    // INITIALIZATION
    // ##########################################################
    // ##########################################################

    // Models
    $scope.loader = { isLoadingData: true, isSubmittingAction: false };
    $scope.branch = branch;
    $scope.preregistrations = [], $scope.reservations = [], $scope.customerservices = [];
    $scope.selectedDeletePreregistration = '', $scope.selectedDeleteReservation = '';
    $scope.doneReservationData = {};
    $scope.selectedView = {}, $scope.selectedDelete = {};

    // Pagination
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    // Local
    var branchPointer = { __type: "Pointer", className: "Branch", objectId: branch.id };
    var selectedDoneReservation;

    getPreregistrations();



    // ##########################################################
    // ##########################################################
    // GETTERS
    // ##########################################################
    // ##########################################################

    function getPreregistrations() {
        $scope.currentPage = 1;
        Parse.Cloud.run('getPreregistrations', { branchPointer: branchPointer }).then(function(response) {
            $scope.loader.isLoadingData = false;
            $scope.preregistrations = response;
            $scope.$apply();
        }, function(error) {
            console.log('getPreregistrations', error)
            uikitService.notification(error.message, 'danger');
            $scope.loader.isLoadingData = false;
            $scope.$apply();
        });
    }

    function getReservations() {
        $scope.currentPage = 1;
        Parse.Cloud.run('getReservationsNotDone', { branchPointer: branchPointer }).then(function(response) {
            $scope.loader.isLoadingData = false;
            $scope.reservations = response;
            $scope.$apply();
        }, function(error) {
            console.log('getReservationsNotDone', error)
            uikitService.notification(error.message, 'danger');
            $scope.loader.isLoadingData = false;
            $scope.$apply();
        });
    }

    function getCustomerServices() {
        $scope.currentPage = 1;
        Parse.Cloud.run('getCustomerServices', { }).then(function(response) {
            $scope.loader.isLoadingData = false;
            $scope.customerservices = response;
            $scope.$apply();
        }, function(error) {
            console.log('getCustomerServices', error)
            uikitService.notification(error.message, 'danger');
            $scope.loader.isLoadingData = false;
            $scope.$apply();
        });
    }



    // ##########################################################
    // ##########################################################
    // CONTROLLER ACTIONS
    // ##########################################################
    // ##########################################################

    $scope.formatDate = function(data) {
        return customService.dateFormat1(data);
    };
    $scope.isOnProcess = function(reservation) {
        return reservation.get('status') === 'ON-PROCESS';
    };
    $scope.setClick = function(num) {
        if (num == 1) {
            getPreregistrations();
        } else if (num == 2) {
            getReservations();
        } else if (num == 3) {
            getCustomerServices();
        }
    };
    $scope.setSelectedDeletePreregistration = function(id) {
        $scope.selectedDeletePreregistration = id;
    };
    $scope.setSelectedDeleteReservation = function(id) {
        $scope.selectedDeleteReservation = id;
    };
    $scope.setSelectedDoneReservation = function(data) {
        selectedDoneReservation = data;
        console.log(data)
    };
    $scope.setView = function(data) {
        $scope.selectedView = data;
    };
    $scope.setDelete = function(data) {
        $scope.selectedDelete = data;
    };

    $scope.getSelectedReservation = function () {
        return selectedDoneReservation;
    };

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

    $scope.approve = function(id) {
        $scope.loader.isSubmittingAction = true;
        Parse.Cloud.run('approvePreregistration', { userId: id }).then(function(response) {
            uikitService.notification('Approve success');
            $state.reload();
        }, function(error) {
            console.log('approvePreregistration', error)
            uikitService.notification(error.message, 'danger');
            $scope.loader.isSubmittingAction = false;
            $scope.$apply();
        });
    };

    $scope.doneReservation = function() {
        if (!isDateValid($scope.doneReservationData.date)) {
            uikitService.notification('Invalid date', 'danger');
        } else {
            $scope.loader.isSubmittingAction = true;
            var data = selectedDoneReservation;

            // update reservation status
            data.set("status", "DONE");
            data.save().then(function() {

                // get client object
                var Client = Parse.Object.extend("Client");
                var client = new Parse.Query(Client);
                client.equalTo("userPointer", data.get("userPointer"));
                client.first({
                    success: function(result) {

                        // create transaction object
                        var Transaction = Parse.Object.extend("Transaction");
                        var transaction = new Transaction();

                        transaction.set("type", data.get("type"));
                        transaction.set("plan", $scope.doneReservationData.plan);
                        transaction.set("amount", $scope.doneReservationData.amount);
                        transaction.set("ar", $scope.doneReservationData.ar);
                        transaction.set("date", $scope.doneReservationData.date);
                        transaction.set("remarks", $scope.doneReservationData.remarks);
                        transaction.set("clientPointer", result);
                        transaction.set("branchPointer", result.get("branchPointer"));
                        transaction.save(null, {
                            success: function() {
                                uikitService.notification('Reservation done');
                                $state.reload();
                            },
                            error: function(error) {
                                console.log('transaction.save', error)
                                uikitService.notification(error.message, 'danger');
                                $scope.loader.isSubmittingAction = false;
                                $scope.$apply();
                            }
                        });

                    },
                    error: function(error) {
                        console.log('Parse.Query(Client)', error)
                        uikitService.notification(error.message, 'danger');
                        $scope.loader.isSubmittingAction = false;
                        $scope.$apply();
                    }
                });

            }, function(error) {
                console.log('doneReservation', error)
                uikitService.notification(error.message, 'danger');
                $scope.loader.isSubmittingAction = false;
                $scope.$apply();
            });
        }
    };

    $scope.deletePreregistration = function() {
        if (!$scope.loader.isSubmittingAction) {
            $scope.loader.isSubmittingAction = true;
            Parse.Cloud.run('deletePreregistration', { userId: $scope.selectedDeletePreregistration }).then(function(response) {
                uikitService.notification('Delete success');
                $state.reload();
            }, function(error) {
                console.log('deletePreregistration', error)
                uikitService.notification(error.message, 'danger');
                $scope.loader.isSubmittingAction = false;
                $scope.$apply();
            });
        }
    };

    $scope.deleteReservation = function() {
        if (!$scope.loader.isSubmittingAction) {
            $scope.loader.isSubmittingAction = true;
            Parse.Cloud.run('deleteReservation', { id: $scope.selectedDeleteReservation }).then(function(response) {
                uikitService.notification('Delete success');
                $state.reload();
            }, function(error) {
                console.log('deleteReservation', error)
                uikitService.notification(error.message, 'danger');
                $scope.loader.isSubmittingAction = false;
                $scope.$apply();
            });
        }
    };

    $scope.deleteCustomerService = function() {
        $scope.loader.isSubmittingAction = true;
        Parse.Cloud.run('deleteCustomerService', { id: $scope.selectedDelete.id }).then(function(response) {
            uikitService.notification('Delete success');
            $state.reload();
        }, function(error) {
            console.log('deleteCustomerService error', error)
            uikitService.notification(error.message, 'danger');
            $scope.loader.isSubmittingAction = false;
            $scope.$apply();
        });
    };

    $scope.updateReservationStatus = function(reservation) {
        $scope.loader.isSubmittingAction = true;

        reservation.set('status', 'ON-PROCESS')
        reservation.save().then(function() {
            uikitService.notification('Reservation updated!');
            $scope.loader.isSubmittingAction = false;
            $scope.$apply();
        }, function(error) {
            console.log('reservation.save', error)
            uikitService.notification(error.message, 'danger');
            $scope.loader.isSubmittingAction = false;
            $scope.$apply();
        });
    };

}