angular
    .module("App")
    .controller("adminSidebarCtrl", adminSidebarCtrl);
adminSidebarCtrl.$inject = ['$scope', '$state'];
function adminSidebarCtrl($scope, $state) {

    $scope.currentState = $state.current.name;

}