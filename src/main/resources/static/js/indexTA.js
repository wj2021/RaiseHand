$(function() {
    toastr.options.timeOut = 2000;
    // 获取所有座位的举手状态并展示
    getAllSeats();
    var task = setInterval(function() {
        getAllSeats(task);
    }, 3000);
});

// 插入空白位置，即机位不存在
function insertBlankSeat(ans, width, margin=16) {
    ans.append("<td><div style='width: "+width+"px; height: "+width+"px; margin: "+margin+"px auto;'></div></td>");
    ans.append("<td><div style='width: 5px; height: 5px;'></div></td>");
}

// 插入行号或者列号
function insertIndex(ans, width, index) {
    ans.append("<td><div style='width: " +width+ "px; height: " +width+ "px; line-height: " +width+ "px; background-color: #FFFFFF; text-align: center; color: black;'>"+index+"</div></td>");
    ans.append("<td><div style='width: 5px; height: 5px;'></div></td>");
}

// 插入实际存在的机位
function insertSeat(ans, width, number, title, bg_color, text_color, status, want) {
    ans.append("<td><div id='"+number+"' class='waves' title='"+title+"' style='width: " +width+ "px; height: " +width+ "px; line-height: " +width+ "px; margin: 16px auto; background-color: " +bg_color+ "; text-align: center; font-weight: 600; color: " +text_color+ "; cursor: pointer;' value='"+status+"' want='"+want+"'; onclick='updateHand($(this).attr(\"want\"), $(this).text(), event)' >"+number+"</div></td>");
    ans.append("<td><div style='width: 5px; height: 5px;'></div></td>");
}

function getAllSeats(task) {
    var ans = new StringBuffer();
    // 在页面加载时将数据渲染到html中去
    $.ajax({
        url : "/getAllSeats",
        type: "post",
        data: null,
        dataType:"json",
        success: function(result, _status, _xhr) {
            // 总列数
            var maxJ = result.maxJ;

            // 根据窗口大小调整每个座位的展示大小
            var width = $("#content").width();
            var eachWidth = width / maxJ;
            if(eachWidth < 40) eachWidth = 40;
            if(eachWidth > 50) eachWidth = 50;

            // 显示列号
            ans.append("<tr>");
            insertBlankSeat(ans, eachWidth, 0);
            for(var j=0; j<=maxJ; ++j) {
                insertIndex(ans, eachWidth, j);
            }
            ans.append("</tr>");

            var lastI = -1; lastJ = -1; // 上一个插入的位置
            var ii = 0, jj = 0; // 将要插入的位置
            $.each(result.data, function(_i, seat) {
                if(seat.i != lastI) {
                    if(lastI != -1) {
                        // 用空白补上一行缺失的部分
                        while(lastJ < maxJ) {
                            insertBlankSeat(ans, eachWidth);
                            lastJ++;
                        }
                        // 上一行结束
                        ans.append("</tr>");
                        ii++; jj = 0;
                    }
                    // 下一行开始
                    ans.append("<tr>");
                    insertIndex(ans, eachWidth, seat.i);
                    lastI = seat.i;
                }
                while(ii < seat.i) {
                    // 整行空位补充
                    for(var k=0; k<=maxJ; ++k) {
                        insertBlankSeat(ans, eachWidth);
                    }
                    ans.append("</tr>");
                    ans.append("<tr>");
                    ii++;
                }
                // 空位补充
                while(jj < seat.j) {
                    insertBlankSeat(ans, eachWidth);
                    jj++;
                }
                if(seat.i == ii && seat.j == jj) {
                    if(seat.status == 0) insertSeat(ans, eachWidth, seat.number, '已放手，禁止举手', 'aqua', 'black', 0, 1);
                    else if(seat.status == 1) insertSeat(ans, eachWidth, seat.number, '学生已举手，单击接单', 'red', 'aliceblue', 1, 2);
                    else if(seat.status == 2) insertSeat(ans, eachWidth, seat.number, '回答完毕，单击放手', 'gold', 'black', 2, 0);
                    else {
                        toastr.error("机位状态错误，请联系管理员重置机位！");
                        window.clearInterval(task);
                        return ;
                    }
                    jj++;
                    lastJ = seat.j;
                }
            });
            ans.append("</tr>");
            $("#content").html("");
            $("#content").html(ans.toString());
        },
        error: function(_result, _err, _ex) {
            window.clearInterval(task);
            toastr.error("发生异常，加载错误，请刷新页面重试！");
        }
    });
}

// 举手或放手操作
function updateHand(wantStatus, number, event) {
    if(event) showWaves(event);
    if(wantStatus == 1) {
        toastr.error("助教或老师不允许举手！");
        return ;
    }
    number = number.toUpperCase();
    var currStatus = $("#"+number).attr('value');
    if(currStatus == wantStatus || (currStatus == 0 && wantStatus == 2) || (currStatus == 1 && wantStatus == 0)) {
        toastr.error("无效操作，请刷新页面后重试！");
        return;
    }
    $.ajax({
        url : "/updateHandStatus",
        type: "post",
        data: {"number": number, "currStatus": currStatus, "wantStatus": wantStatus},
        dataType:"json",
        success: function(result, _status, _xhr) {
            if(result.success == "success") {
                if(wantStatus == 0) {
                    // 修改页面显示
                    $("#"+number)[0].title = "已放手，禁止举手";
                    $("#"+number)[0].attributes.value.value = 0;
                    $("#"+number)[0].attributes.want.value = 1;
                    $("#"+number)[0].style.backgroundColor = "aqua";
                    $("#"+number)[0].style.color = "black";
                    toastr.success("放手成功！");
                }
                if(wantStatus == 2) {
                    // 修改页面显示
                    $("#"+number)[0].title = "回答完毕，单击放手";
                    $("#"+number)[0].attributes.value.value = 2;
                    $("#"+number)[0].attributes.want.value = 0;
                    $("#"+number)[0].style.backgroundColor = "gold";
                    $("#"+number)[0].style.color = "black";
                    toastr.success("接单成功，请前往"+number+"机位回答学生问题！");
                }
            }
            if(result.success == "fail") {
                toastr.error("失败，请刷新页面或等待3秒后重试！");
            }
        },
        error: function(_result, _err, _ex) {
            toastr.error("网络异常！");
        }
    });
}

// 自定义StringBuffer工具类
class StringBuffer {
    constructor() {
        this._strings_ = new Array();
    }
    append(str) {
        this._strings_.push(str);
    }
    clear() {
        this._strings_.length = 0;
    }
    toString() {
        return this._strings_.join("");
    }
}