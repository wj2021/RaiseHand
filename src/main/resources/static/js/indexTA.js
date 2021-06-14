var autoHnadDownTime = 300; // 当助教接单后超过 autoHnadDownTime 秒后自动放手
$(function() {
    toastr.options.timeOut = 3000;
    // 获取所有座位的举手状态并展示
    getAllSeats();
    var task = setInterval(function() {
        getAllSeats(task);
    }, 3000);

    var autoHandDownTask = setInterval(function() {
        autoHandDown(autoHandDownTask);
    }, 5000);
});

// 插入空白位置，即机位不存在
function insertBlankSeat(ans, seatWidth, interWidth, margin=16) {
    ans.append("<td><div style='width: "+seatWidth+"px; height: "+seatWidth+"px; margin: "+margin+"px auto; background-color: #FFFFFF;'></div></td>");
    ans.append("<td><div style='width: "+interWidth+"px; height: "+interWidth+"px;'></div></td>");
}

// 插入行号或者列号
function insertIndex(ans, seatWidth, interWidth, index) {
    ans.append("<td><div style='width: " +seatWidth+ "px; height: " +seatWidth+ "px; line-height: " +seatWidth+ "px; background-color: #FFFFFF; text-align: center; color: black;'>"+index+"</div></td>");
    ans.append("<td><div style='width: "+interWidth+"px; height: "+interWidth+"px;'></div></td>");
}

// 插入实际存在的机位
function insertSeat(ans, seatWidth, interWidth, number, title, bg_color, text_color, status, want) {
    ans.append("<td><div id='"+number+"' class='waves' title='"+title+"' style='width: " +seatWidth+ "px; height: " +seatWidth+ "px; line-height: " +seatWidth+ "px; margin: 16px auto; background-color: " +bg_color+ "; text-align: center; font-weight: 600; color: " +text_color+ "; cursor: pointer;' value='"+status+"' want='"+want+"'; onclick='updateHand($(this).attr(\"want\"), $(this).text(), event)' >"+number+"</div></td>");
    ans.append("<td><div style='width: "+interWidth+"px; height: "+interWidth+"px;'></div></td>");
}

// 当助教接单后，由于不允许学生放手，如果助教忘记放手，学生就再也无法举手了，所以这里设置一个自动放手的请求，当助教接单超过 seconds 秒后自动放手
function autoHandDown(task) {
    $.ajax({
        url: "/autoHandDown",
        type: "post",
        data: {"seconds": autoHnadDownTime},
        dataType: "json",
        success: function(_result, _status, _xhr) {
        },
        error: function(_result, _err, _ex) {
            window.clearInterval(task);
            toastr.error("发生异常，加载错误，请刷新页面重试！");
        }
    });
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
            if(result.maxJ == -1) {
                toastr.error("无机位数据，请添加机位信息！");
                window.clearInterval(task);
                return ;
            }

            // 总列数
            var maxJ = result.maxJ;
            var maxI = 0;

            // 根据窗口大小调整每个座位的展示大小
            var width = $("#content").width();
            var interWidth = Math.round(width/(maxJ+6)/9);
            var eachWidth = interWidth * 8;
            if(eachWidth < 40) {
                interWidth = 5;
                eachWidth = 40;
            }
            if(eachWidth > 56) {
                interWidth = 7;
                eachWidth = 56;
            }
            // 过道的宽度
            var aisleWidth = 30;
            var rowBlanks = result.rowBlanks.split(",");
            var colBlanks = result.colBlanks.split(",");

            // 显示列号
            ans.append("<tr class='my_content'>");
            insertBlankSeat(ans, eachWidth, interWidth, 0);
            for(var j=0; j<=maxJ; ++j) {
                if(colBlanks.indexOf(j.toString()) != -1) insertBlankSeat(ans, aisleWidth, interWidth, 0); // 这里的空白是过道
                insertIndex(ans, eachWidth, interWidth, j);
            }
            if(colBlanks.indexOf((maxJ+1)+"") != -1) insertBlankSeat(ans, aisleWidth, interWidth, 0);
            ans.append("</tr>");

            var lastI = -1; lastJ = -1; // 上一个插入的位置
            var ii = 0, jj = 0; // 将要插入的位置
            $.each(result.data, function(_i, seat) {
                if(seat.i != lastI) {
                    if(lastI != -1) {
                        // 用空白补上一行缺失的部分
                        while(lastJ < maxJ) {
                            var currJ = lastJ+1;
                            if(colBlanks.indexOf(currJ.toString()) != -1) insertBlankSeat(ans, aisleWidth, interWidth, 0); // 这里的空白是过道
                            insertBlankSeat(ans, eachWidth, interWidth);
                            lastJ++;
                        }
                        if(colBlanks.indexOf((maxJ+1)+"") != -1) insertBlankSeat(ans, aisleWidth, interWidth, 0);
                        // 上一行结束
                        ans.append("</tr>");
                        ii++; jj = 0;
                    }
                    // 如果该行设置了空白过道，我们先插入过道
                    var pos = rowBlanks.indexOf(seat.i+"");
                    if(pos != -1) {
                        ans.append("<tr class='my_content'>");
                        insertBlankSeat(ans, eachWidth, interWidth, 0);
                        for(var k=0; k<=maxJ; ++k) {
                            if(colBlanks.indexOf(k+"") != -1) insertBlankSeat(ans, aisleWidth, interWidth, 0);
                            insertBlankSeat(ans, eachWidth, interWidth);
                        }
                        if(colBlanks.indexOf(maxJ+1+"") != -1) insertBlankSeat(ans, aisleWidth, interWidth, 0);
                        rowBlanks.splice(pos, 1);
                        ans.append("</tr>");
                    }
                    // 下一行开始
                    ans.append("<tr class='my_content'>");
                    if(ii == seat.i) insertIndex(ans, eachWidth, interWidth, seat.i);
                    lastI = seat.i;
                }
                while(ii < seat.i) {
                    // 整行空位补充
                    insertIndex(ans, eachWidth, interWidth, ii);
                    for(var k=0; k<=maxJ; ++k) {
                        if(colBlanks.indexOf(k+"") != -1) insertBlankSeat(ans, aisleWidth, interWidth, 0); // 这里的空白是过道
                        insertBlankSeat(ans, eachWidth, interWidth);
                    }
                    if(colBlanks.indexOf(maxJ+1+"") != -1) insertBlankSeat(ans, aisleWidth, interWidth, 0);
                    ans.append("</tr>");
                    ii++;
                    ans.append("<tr class='my_content'>");
                    if(ii == seat.i) insertIndex(ans, eachWidth, interWidth, seat.i);
                }
                // 空位补充
                while(jj < seat.j) {
                    if(colBlanks.indexOf(jj+"") != -1) insertBlankSeat(ans, aisleWidth, interWidth, 0); // 这里的空白是过道
                    insertBlankSeat(ans, eachWidth, interWidth);
                    jj++;
                }
                if(seat.i == ii && seat.j == jj) {
                    if(colBlanks.indexOf(jj+"") != -1) insertBlankSeat(ans, aisleWidth, interWidth, 0); // 这里的空白是过道
                    if(seat.status == 0) insertSeat(ans, eachWidth, interWidth, seat.number, '已放手，禁止举手', 'aqua', 'black', 0, 1);
                    else if(seat.status == 1) insertSeat(ans, eachWidth, interWidth, seat.number, '学生已举手，单击接单', 'red', 'aliceblue', 1, 2);
                    else if(seat.status == 2) insertSeat(ans, eachWidth, interWidth, seat.number, '回答完毕，单击放手', 'gold', 'black', 2, 0);
                    else {
                        toastr.error("机位状态错误，请联系管理员重置机位！");
                        window.clearInterval(task);
                        return ;
                    }
                    jj++;
                    lastJ = seat.j;
                    maxI = seat.i;
                }
            });
            
            // 最后一行空位补充
            while(lastJ < maxJ) {
                var currJ = lastJ+1;
                if(colBlanks.indexOf(currJ.toString()) != -1) insertBlankSeat(ans, aisleWidth, interWidth, 0); // 这里的空白是过道
                insertBlankSeat(ans, eachWidth, interWidth);
                lastJ++;
            }
            if(colBlanks.indexOf(maxJ+1+"") != -1) insertBlankSeat(ans, aisleWidth, interWidth, 0);
            ans.append("</tr>");

            if(rowBlanks.indexOf(maxI+1+"") != -1) {
                // 最后一行后面存在空行
                ans.append("<tr class='my_content'>");
                insertBlankSeat(ans, eachWidth, interWidth, 0);
                for(var k=0; k<=maxJ; ++k) {
                    if(colBlanks.indexOf(k+"") != -1) insertBlankSeat(ans, aisleWidth, interWidth, 0);
                    insertBlankSeat(ans, eachWidth, interWidth);
                }
                if(colBlanks.indexOf(maxJ+1+"") != -1) insertBlankSeat(ans, aisleWidth, interWidth, 0);
                ans.append("</tr>");
            }

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