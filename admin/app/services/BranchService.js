angular
    .module("App")
    .service('BranchService', BranchService);

BranchService.$inject = ['parseService'];
function BranchService(parseService){
    this.getBranch = function(){
        var currentUser = parseService.getCurrentUser();
        var userPointer = { __type: "Pointer", className: "_User", objectId: currentUser.id };

        var Branch = Parse.Object.extend("Branch");
        var query = new Parse.Query(Branch);
        query.equalTo("userPointer", userPointer);

        return query.first();
    };
}