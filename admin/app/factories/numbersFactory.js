angular
    .module('App')
    .factory('numbersFactory', numbersFactory);

numbersFactory.$inject = ['$http'];
function numbersFactory($http) {
    return {
        get: function () {
            return $http.get('assets/json/numbers.json');
        }
    };
}