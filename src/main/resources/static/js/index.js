var handupTimer = 0;
var handdownTimer = 0;
var waitTime = 120;
$(function() {
    toastr.options.timeOut = 3000;

    $("#number").focus();
    // 响应敲击回车事件
    $("#number").keyup(function(event) {
        if(event.keyCode == 13) updateHand(1, $("#number").val(), event);
    });

    // 测试浏览器cookie是否被禁用
    setCookie("testCookie", 1, 10000);
    if(getCookie("testCookie") == null) {
        toastr.error("请打开cookie！");
        return ;
    }

    // 刷新网页后从cookie中读取倒计时数据
    if(getCookie("handupTimer") != null) handupTimer = getCookie("handupTimer");
    if(getCookie("handdownTimer") != null) handdownTimer = getCookie("handdownTimer");

    // 获取所有座位的举手状态并展示
    getAllSeats();
    var task = setInterval(function() {
        getAllSeats(task);
    }, 3000);

    // 进度条处理
    processProgress();
    setInterval(function() {
        processProgress();
    }, 1000);
});

// 插入空白位置，即机位不存在
function insertBlankSeat(ans, seatWidth, interWidth, margin=16) {
    ans.append("<td><div style='width: "+seatWidth+"px; height: "+seatWidth+"px; margin: "+margin+"px auto;'></div></td>");
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

            // 显示列号
            ans.append("<tr class='my_content'>");
            insertBlankSeat(ans, eachWidth, interWidth, 0);
            for(var j=0; j<=maxJ; ++j) {
                if(j==5 || j==7 || j==9 || j==16) insertBlankSeat(ans, aisleWidth, interWidth, 0); // 这里的空白是过道
                insertIndex(ans, eachWidth, interWidth, j);
            }
            ans.append("</tr>");

            var lastI = -1; lastJ = -1; // 上一个插入的位置
            var ii = 0, jj = 0; // 将要插入的位置
            $.each(result.data, function(_i, seat) {
                if(seat.i != lastI) {
                    if(lastI != -1) {
                        // 补上一行缺失的部分
                        while(lastJ < maxJ) {
                            var currJ = lastJ+1;
                            if(currJ==5 || currJ==7 || currJ==9 || currJ==16) insertBlankSeat(ans, aisleWidth, interWidth); // 这里的空白是过道
                            insertBlankSeat(ans, eachWidth, interWidth);
                            lastJ++;
                        }
                        // 上一行结束
                        ans.append("</tr>");
                        ii++; jj = 0;
                    }
                    // 下一行开始
                    ans.append("<tr class='my_content'>");
                    insertIndex(ans, eachWidth, interWidth, seat.i);
                    lastI = seat.i;
                }
                // 整行缺失
                while(ii < seat.i) {
                    for(var k=0; k<=maxJ; ++k) {
                        if(k==5 || k==7 || k==9 || k==16) insertBlankSeat(ans, aisleWidth, interWidth); // 这里的空白是过道
                        insertBlankSeat(ans, eachWidth, interWidth);
                    }
                    ans.append("</tr>");
                    ans.append("<tr class='my_content'>");
                    ii++;
                }
                // 空位补充
                while(jj < seat.j) {
                    if(jj==5 || jj==7 || jj==9 || jj==16) insertBlankSeat(ans, aisleWidth, interWidth); // 这里的空白是过道
                    insertBlankSeat(ans, eachWidth, interWidth);
                    jj++;
                }
                if(seat.i == ii && seat.j == jj) {
                    if(jj==5 || jj==7 || jj==9 || jj==16) insertBlankSeat(ans, aisleWidth, interWidth); // 这里的空白是过道
                    if(seat.status == 0) insertSeat(ans, eachWidth, interWidth, seat.number, '已放手，单击举手', 'aqua', 'black', 0, 1);
                    else if(seat.status == 1) insertSeat(ans, eachWidth, interWidth, seat.number, '已举手，等待助教接单，点击放手', 'red', 'aliceblue', 1, 0);
                    else if(seat.status == 2) insertSeat(ans, eachWidth, interWidth, seat.number, '助教已接单，马上赶到，请耐心等待', 'gold', 'black', 2, 0);
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
    // 仅仅在前端进行了校验是否存在
    if($("#"+number).length == 0) return "输入机位号不存在！";
    return "1";
}

// 举手或放手操作
function updateHand(wantStatus, number, event) {
    if(event) showWaves(event);
    // 前端输入校验
    number = number.toUpperCase();
    var msg = validateNumber(number);
    if(msg != "1") {
        toastr.error(msg);
        return ;
    }
    // 获取number机位的当前状态
    var currStatus = $("#"+number).attr('value');
    if(wantStatus == 2) {toastr.error("非法操作！"); return ;}
    if(currStatus == 2 && wantStatus == 0) {toastr.error("禁止放手，请耐心等待助教赶来！"); return ;}
    if(currStatus == 2 && wantStatus == 1) {toastr.error("已举手，请耐心等待助教赶来！"); return ;}
    if(currStatus == 0 && wantStatus == 1 && handupTimer > 0) {toastr.error(Math.round(waitTime/60)+"分钟内只能举一次手！还需等待"+handupTimer+"秒！"); return ;}
    if(currStatus == 1 && wantStatus == 0 && handdownTimer > 0) {toastr.error(Math.round(waitTime/60)+"分钟内只能放一次手！还需等待"+handdownTimer+"秒"); return ;}
    if(currStatus == 0 && wantStatus == 0) {toastr.error("已放手！"); return;}
    if(currStatus == 1 && wantStatus == 1) {toastr.error("已举手！"); return;}
    if(wantStatus == 0) handdownTimer = waitTime;
    else handupTimer = waitTime;
    processProgress();
    $.ajax({
        url : "/updateHandStatus",
        type: "post",
        data: {"number": number, "currStatus": currStatus, "wantStatus": wantStatus},
        dataType:"json",
        success: function(result, _status, _xhr) {
            if(result.success == "success") {
                if(wantStatus == 0) {
                    // 修改页面显示
                    $("#"+number)[0].title = "已放手，单击举手";
                    $("#"+number)[0].attributes.value.value = 0;
                    $("#"+number)[0].attributes.want.value = 1;
                    $("#"+number)[0].style.backgroundColor = "aqua";
                    $("#"+number)[0].style.color = "black";
                    toastr.success("放手成功！");
                }
                if(wantStatus == 1) {
                    // 修改页面显示
                    $("#"+number)[0].title = "已举手，等待助教接单，点击放手";
                    $("#"+number)[0].attributes.value.value = 1;
                    $("#"+number)[0].attributes.want.value = 0;
                    $("#"+number)[0].style.backgroundColor = "red";
                    $("#"+number)[0].style.color = "aliceblue";
                    toastr.success("举手成功！");
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

function processProgress() {
    if(handupTimer > 0) {
        handupTimer -= 1;
        setCookie("handupTimer", handupTimer, handupTimer*1000);
    }
    if(handdownTimer > 0) {
        handdownTimer -= 1;
        setCookie("handdownTimer", handdownTimer, handdownTimer*1000);
    }
    if(handupTimer > 0) {
        $("#handup-progress").text(handupTimer);
        $("#handup-progress")[0].style.color = "white";
        $("#handup-progress")[0].style.backgroundColor = "red";
        $("#handup-progress")[0].style.width = (100*handupTimer/waitTime)+"%";
    }
    else {
        $("#handup-progress").text('');
        $("#handup-progress")[0].style.color = "black";
        $("#handup-progress")[0].style.backgroundColor = "springgreen";
        $("#handup-progress")[0].style.width = "100%";
    }
    if(handdownTimer > 0) {
        $("#handdown-progress").text(handdownTimer);
        $("#handdown-progress")[0].style.color = "black";
        $("#handdown-progress")[0].style.backgroundColor = "aqua";
        $("#handdown-progress")[0].style.width = (100*handdownTimer/waitTime)+"%";
    } else {
        $("#handdown-progress").text('');
        $("#handdown-progress")[0].style.color = "black";
        $("#handdown-progress")[0].style.backgroundColor = "springgreen";
        $("#handdown-progress")[0].style.width = "100%";
    }
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


// 写cookies
function setCookie(name, value, expTime) { 
    var exp = new Date(); 
    exp.setTime(exp.getTime() + expTime);
    document.cookie = name + "=" + escape(value) + "; expires=" + exp.toGMTString() + ";path=/"; 
}

// 获取cookies
function getCookie(name) { 
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}