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
                $("#all").removeClass("uk-hidden");
                $("#Silang").addClass("uk-hidden");
                break;
            case "Silang":
                $("#Silang").removeClass("uk-hidden");
                $("#all").addClass("uk-hidden");
                break;


        }
    });




});

