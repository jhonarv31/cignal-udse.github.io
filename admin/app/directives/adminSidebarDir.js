angular
    .module('App')
    .directive('adminSidebar',adminSidebar);
function adminSidebar(){
    return{
        restrict: 'E',
        templateUrl: 'app/directives/views/adminSidebar.html',
        controller: 'adminSidebarCtrl'
    }
}