// 页面加载时自动执行
$(function() {
    toastr.options.timeOut = 1000;
    $("#number").focus();
    // 响应敲击回车事件
    $("#number, #i, #j").keyup(function(event){
        if(event.keyCode == 13) insertSeat();
    });
});

// 校验输入的机位号是否合法
function validateNumber(number) {
    if(number == '') return "输入机位号为空！";
    for(var i=0; i<number.length; ++i) {
        if(/^\d/.test(number[i])) {
            var ss = number.substring(0, i);
            var ee = number.substring(i);
            if(/^\d+$/.test(ee)) {
                number = ss + parseInt(ee);
                break;
            } else return "输入机位号非法！";
        }
    }
    return "1";
}

// 向数据库中插入一个机位
function insertSeat() {
    var number = $("#number").val().trim();
    number = number.toUpperCase();
    var msg = validateNumber(number);
    if(msg != "1") {
        toastr.error(msg);
        return ;
    }
    if(!/^\d+$/.test($("#i").val().trim()) || !/^\d+$/.test($("#j").val().trim())) {
        toastr.error("输入行号或列号有误！");
        return ;
    }
    $.ajax({
        url : "/insertSeat",
        type: "post",
        data:{"number": number, "i": $("#i").val().trim(), "j": $("#j").val().trim()},
        dataType:"json",
        success : function(_result, _status, _xhr) {
            toastr.success("插入机位" + number + "成功！");
        },
        error : function(result, err, ex) {
            console.info(result);
            console.info(err);
            console.info(ex);
            toastr.error("插入失败！");
        }
    });
}

// 删除机位
function deleteSeat() {
    var number = $("#number").val().trim();
    number = number.toUpperCase();
    var msg = validateNumber(number);
    if(msg != "1") {
        toastr.error(msg);
        return ;
    }
    $.ajax({
        url : "/deleteSeat",
        type: "post",
        data:{"number": number},
        dataType:"json",
        success : function(_result, _status, _xhr) {
            toastr.success("删除机位" + number + "成功！");
        },
        error : function(result, err, ex) {
            console.info(result);
            console.info(err);
            console.info(ex);
            toastr.error("删除失败！");
        }
    });
}

// 重置座位
function initSeat() {
    $.ajax({
        url: "/initSeat",
        type: "post",
        data: {},
        dataType: "json",
        success : function(_result, _status, _xhr) {
            toastr.success("重置机位成功！");
        },
        error : function(result, err, ex) {
            console.info(result);
            console.info(err);
            console.info(ex);
            toastr.error("重置机位失败！");
        }
    });
}