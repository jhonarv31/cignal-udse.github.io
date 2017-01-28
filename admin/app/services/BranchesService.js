angular
    .module("App")
    .service('BranchesService', BranchesService);

function BranchesService(){
    this.getBranches = function(){
        var Branch = Parse.Object.extend("Branch");
        var query = new Parse.Query(Branch);
        query.descending('updatedAt');
        query.include('userPointer');

        return query.find();
    };
}