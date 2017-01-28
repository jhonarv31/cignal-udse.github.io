angular
    .module("App")
    .service('EventsService', EventsService);

function EventsService(){
    this.getEvents = function(){
        var Post = Parse.Object.extend("Post");
        var query = new Parse.Query(Post);
        query.descending('updatedAt');

        return query.find();
    };
}