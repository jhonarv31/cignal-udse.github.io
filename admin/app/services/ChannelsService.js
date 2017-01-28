angular
    .module("App")
    .service('ChannelsService', ChannelsService);

function ChannelsService(){
    this.getChannels = function(){
        var Channel = Parse.Object.extend("Channel");
        var query = new Parse.Query(Channel);
        //query.ascending("type,name");
        query.descending('updatedAt');

        return query.find();
    };
}