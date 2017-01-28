angular
    .module("App")
    .service('ReservationsService', ReservationsService);

function ReservationsService(){
    this.getReservations = function(){
        var Reservation = Parse.Object.extend("Reservation");
        var query = new Parse.Query(Reservation);
        query.descending('updatedAt');

        return query.find();
    };
}