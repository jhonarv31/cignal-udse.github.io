angular
    .module('App')
    .directive('branchSidebar',branchSidebar);
function branchSidebar(){
    return{
        restrict: 'E',
        templateUrl: 'app/directives/views/branchSidebar.html',
        controller: 'branchSidebarCtrl'
    }
}