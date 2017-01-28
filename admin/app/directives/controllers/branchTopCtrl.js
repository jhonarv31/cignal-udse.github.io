angular
    .module("App")
    .controller("branchTopCtrl", branchTopCtrl);
branchTopCtrl.$inject = ['$scope', '$state', '$timeout', '$localStorage', 'parseService'];
function branchTopCtrl($scope, $state, $timeout, $localStorage, parseService) {

    $scope.currentUser = parseService.getCurrentUser();
    $scope.currentState = $state.current.name;

    $scope.logout = function() {
        if (!$scope.loader.isLoggingOut) {
            $scope.loader.isLoggingOut = true;
            Parse.User.logOut().then(function() {
                if (!$localStorage.ocmWebsite.keepMeLoggedIn) {
                    $localStorage.ocmWebsite.user.username = '';
                    $localStorage.ocmWebsite.user.password = '';
                }
                $scope.$apply();
                $state.transitionTo('login');
            });
        }
    };

    // 15 minute idle timer
    var timer = $timeout(function() {
        timer = null;
        Parse.User.logOut().then(function() {
            if (!$localStorage.ocmWebsite.keepMeLoggedIn) {
                $localStorage.ocmWebsite.user.username = '';
                $localStorage.ocmWebsite.user.password = '';
            }
            $scope.$apply();

            var modal = UIkit.modal('#idle');
            modal.on({
                'show.uk.modal': function(){},
                'hide.uk.modal': function(){
                    $state.transitionTo('login');
                }
            });
            modal.show();
        });
    }, 900000);

    $scope.$on("$destroy", function(event) {
        if (timer)
            $timeout.cancel(timer);
    });

}