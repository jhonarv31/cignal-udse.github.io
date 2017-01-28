angular
    .module("App")
    .service('parseService', parseService);

function parseService(){
    this.getCurrentUser = function(){
        return Parse.User.current();
    };
}