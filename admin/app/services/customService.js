angular
    .module("App")
    .service('customService', customService);

function customService(){

    // MM/DD/YYYY (ex: 7/13/2016)
    this.dateFormat1 = function(data){
        var date = new Date(data);
        return (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
    };

    // MM/DD/YYYY (ex: July 13)
    this.dateFormat2 = function(data){
        var date = new Date(data);
        var months = [{long: "January", short: "Jan"}, {long: "February", short: "Feb"}, {long: "March", short: "Mar"}, {long: "April", short: "Apr"}, {long: "May", short: "May"}, {long: "June", short: "Jun"}, {long: "July", short: "Jul"}, {long: "August", short: "Aug"}, {long: "September", short: "Sep"}, {long: "October", short: "Oct"}, {long: "November", short: "Nov"}, {long: "December", short: "Dec"}];
        return months[(date.getMonth())].short + ' ' + date.getDate() + ' ' + date.getFullYear();
    };

    // Military time (ex: 13:00)
    this.timeFormat1 = function(data){
        var date = new Date(data);
        var minutes = (date.getMinutes() < 10)? '0' + date.getMinutes() : date.getMinutes();
        return date.getHours() + ':' + minutes;
    };

    // Normal time (ex: 1:00 PM)
    this.timeFormat2 = function(data){
        var date = new Date(data);
        var hours = date.getHours();
        var minutes = (date.getMinutes() < 10)? '0' + date.getMinutes() : date.getMinutes();
        var symbol = 'AM';

        if (hours == 0) {
            hours = 12;
        } else if (hours > 12) {
            hours -= 12;
            symbol = 'PM';
        }

        return hours + ':' + minutes + ' ' + symbol;
    };

    this.toTitleCase = function(str) {
        str = str.toLowerCase().split(' ');
        for (var i = 0; i < str.length; i++) {
            str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
        }
        return str.join(' ');
    };

    this.randomCharacters = function(length) {
        var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP1234567890";
        var str = "";
        for (var x = 0; x < length; x++) {
            var i = Math.floor(Math.random() * chars.length);
            str += chars.charAt(i);
        }
        return str;
    };

    this.enterEvent = function($event, myFunction) {
        var keyCode = $event.which || $event.keyCode;
        if (keyCode === 13) {
            myFunction();
        }
    };

}

String.prototype.toTitleCase = function() {
    var str = this.toLowerCase().split(' ');
    for (var i = 0; i < str.length; i++) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    }
    return str.join(' ');
};