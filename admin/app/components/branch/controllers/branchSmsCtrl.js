angular
    .module("App")
    .controller("branchSmsCtrl", branchSmsCtrl);
branchSmsCtrl.$inject = ['$scope', '$timeout', '$state', 'uikitService', 'customService', 'branch'];
function branchSmsCtrl($scope, $timeout, $state, uikitService, customService, branch) {
    console.log('branchSmsCtrl')

    // ##########################################################
    // ##########################################################
    // INITIALIZATION
    // ##########################################################
    // ##########################################################

    // Models
    $scope.loader = { isSubmitting: false };
    $scope.branch = branch;
    $scope.newData = { to: '+639' };



    // ##########################################################
    // ##########################################################
    // USER ACTIONS
    // ##########################################################
    // ##########################################################

    $scope.numberChange = function() {
        if (!$scope.newData.to || ($scope.newData.to && $scope.newData.to.length < 4))
            $scope.newData.to = '+639';
    };

    $scope.myKeypress = function(event) {
        var keyCode = event.which || event.keyCode;

        if (keyCode > 31 && (keyCode < 48 || keyCode > 57))
            event.preventDefault();
    };

    $scope.submit = function() {
        if ($scope.newData.to.length < 13) {
            uikitService.notification('Number invalid', 'danger');
        } else {

            var data = {
                to: $scope.newData.to,
                body: $scope.newData.body + '\n\n' + $scope.newData.sender + '\n\n' + $scope.newData.contact
            };

            $scope.loader.isSubmitting = true;
            Parse.Cloud.run('sendSms', { data: data }).then(function(response) {
                uikitService.notification('SMS sent');
                $state.reload();
            }, function(error) {
                console.log('sendSms', error)
                uikitService.notification(error.message, 'danger');
                $scope.loader.isSubmitting = false;
                $scope.$apply();
            });

        }
    };

}