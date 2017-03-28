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
    $("#select-notif").change(function() {
        var select = $("#select-notif option:selected").val();
        switch (select) {
            case "Online Account Approval":
                $("#smsBody").val("Your online account registration is already approved. You can now log-in using it.");
                $("#smsSender").val("09367903513");
                $("#smsContact").val("09987903513");
                break;
            case "Process Pending":
                $("#smsBody").val("Your service reservation is now PENDING due to documents verification");
                $("#smsSender").val("09367903513");
                $("#smsContact").val("09987903513");
                break;
            case "Application On-Process":
                $("#smsBody").val("Your service reservation is now ON-PROCESS. Please wait for further updates.");
                $("#smsSender").val("09367903513");
                $("#smsContact").val("09987903513");
                break;
            case "Application Approved":
                $("#smsBody").val("Your service reservation is now APPROVED. Technician will be in your location within an hour. Thank you.");
                $("#smsSender").val("09367903513");
                $("#smsContact").val("09987903513");
                break;
            case "Application Disapproved":
                $("#smsBody").val("Your service reservation is DISAPPROVED due to policy conflict");
                $("#smsSender").val("09367903513");
                $("#smsContact").val("09987903513");
                break;
        }
    });




});
