
$(document).ready(function(){

    sum_portions();
    compile_allocations();

});


$("input[id$=portion]").on('change', function(){
    sum_portions();
    compile_allocations();
});


function sum_portions(){
    let sum = 0.0;
    $("input[id$=portion]").each(function(){
        let portion = $(this).val();
        if (portion === "" || parseFloat(portion) < 0.0){
            $(this).val("0.0")
        }else{
            sum = sum + parseFloat(portion);
        }

    });

    $("#allocation_total_percent").html(Number((sum).toFixed(1)));
    color_percent();
}


function compile_allocations(){

    let allocations_list = [];

    $("input[id$=portion]").each(function() {
        let portion = $(this).val();
        if (parseFloat(portion) > 0.01) {
            allocations_list.push({
                "coin": $(this).data("coin").toString(),
                "portion": (parseFloat(portion) / 100).toString()
            });
        }
    });

    $("#allocation_array").val(JSON.stringify(allocations_list));

}

function color_percent(){

    $("#allocation_total_percent").removeClass("text-success text-warning text-danger");

    percent = parseFloat($("#allocation_total_percent").html());

    if (percent > 100 || percent < 90){
        $("#allocation_total_percent").addClass("text-danger");
    } else if (percent < 99){
        $("#allocation_total_percent").addClass("text-warning");
    } else {
        // $("#allocation_total_percent").addClass("text-success");
    }
}
