angular
    .module('App')
    .directive('branchTop',branchTop);
function branchTop(){
    return{
        restrict: 'E',
        templateUrl: 'app/directives/views/branchTop.html',
        controller: 'branchTopCtrl'
    }
}