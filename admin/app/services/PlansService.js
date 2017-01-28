angular
    .module("App")
    .service('PlansService', PlansService);

function PlansService(){
    this.getPlans = function(){
        var Plan = Parse.Object.extend("Plan");
        var query = new Parse.Query(Plan);
        query.descending('updatedAt');

        return query.find();
    };
}