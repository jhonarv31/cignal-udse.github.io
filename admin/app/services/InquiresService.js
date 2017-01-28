angular
    .module("App")
    .service('InquiresService', InquiresService);

function InquiresService(){
    this.getInquires = function(branch){
        var Inquire = Parse.Object.extend("Inquire");
        var query = new Parse.Query(Inquire);
        query.equalTo("branchPointer", branch);
        query.descending('updatedAt');

        return query.find();
    };
}