angular
    .module("App")
    .service('ClientsService', ClientsService);

function ClientsService(){
    this.getClients = function(branch){
        var Client = Parse.Object.extend("Client");
        var query = new Parse.Query(Client);
        query.equalTo("branchPointer", branch);
        query.descending('updatedAt');

        return query.find();
    };
}