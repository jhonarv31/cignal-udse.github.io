/**
 * Created by Jomz on 9/25/2016.
 */
function isNumberKey(evt){
    var charCode = (evt.which) ? evt.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
    return true;
}



$(document).ready(function() {
    $("#select-branch").change(function() {
        var select = $("#select-branch option:selected").val();
        switch (select) {
            case "All":
                $("#print").removeClass("uk-hidden");
                break;
            default :
                $("#print").addClass("uk-hidden");



        }
    });


});
