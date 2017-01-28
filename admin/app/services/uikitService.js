angular
    .module('App')
    .service('uikitService', uikitService);

function uikitService() {
    this.notification = function(msg, status, time, pos) {
        UIkit.notify({
            message : msg,
            status  : status || 'success',
            timeout : time || 2000,
            pos     : pos || 'top-right'
        });
    };
}