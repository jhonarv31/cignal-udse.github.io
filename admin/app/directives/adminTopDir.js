angular
    .module('App')
    .directive('adminTop',adminTop);
function adminTop(){
    return{
        restrict: 'E',
        templateUrl: 'app/directives/views/adminTop.html',
        controller: 'adminTopCtrl'
    }
}