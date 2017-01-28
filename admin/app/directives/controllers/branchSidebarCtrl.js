angular
    .module("App")
    .controller("branchSidebarCtrl", branchSidebarCtrl);
branchSidebarCtrl.$inject = ['$scope', '$state'];
function branchSidebarCtrl($scope, $state) {

    $scope.currentState = $state.current.name;

}