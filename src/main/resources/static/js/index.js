// 页面加载时自动执行
var handupTimer = 0;
var handdownTimer = 0;
var waitTime = 120;
$(function() {
    toastr.options.timeOut = 2000;

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
            ans.append("<td><div style='width: "+eachWidth+"px; height: "+eachWidth+"px;'></div></td>");
            ans.append("<td><div style='width: 5px; height: 5px;'></div></td>");
            for(var j=0; j<=maxJ; ++j) {
                ans.append("<td><div style='width: " +eachWidth+ "px; height: " +eachWidth+ "px; line-height: " +eachWidth+ "px; background-color: #FFFFFF; text-align: center; color: black;'>"+j+"</div></td>");
                ans.append("<td><div style='width: 5px; height: 5px;'></div></td>");
            }
            ans.append("</tr>");

            var lastI = -1; lastJ = -1; // 上一个插入的位置
            var ii = 0, jj = 0; // 将要插入的位置
            var bg_color = 'aqua'; // 未举手状态座位的背景色
            var text_color = 'black'; // 未举手状态座位号的颜色
            var hint = '举手'; // 鼠标悬浮在座位上的显示信息
            var want = 0; // 未举手状态want=1，表示将要举手，同理want=0表示将要放手
            $.each(result.data, function(_i, seat) {
                if(seat.i != lastI) {
                    if(lastI != -1) {
                        // 补上一行缺失的部分
                        while(lastJ < maxJ) {
                            ans.append("<td><div style='width: "+eachWidth+"px; height: "+eachWidth+"px;'></div></td>");
                            ans.append("<td><div style='width: 5px; height: 5px;'></div></td>");
                            lastJ++;
                        }
                        // 上一行结束
                        ans.append("</tr>");
                        ii++; jj = 0;
                    }
                    // 下一行开始
                    ans.append("<tr>");
                    ans.append("<td><div style='width: " +eachWidth+ "px; height: " +eachWidth+ "px; line-height: " +eachWidth+ "px; margin: 16px auto; background-color: #FFFFFF; text-align: center; color: black;'>"+seat.i+"</div></td>");
                    ans.append("<td><div style='width: 5px; height: 5px;'></div></td>");
                    lastI = seat.i;
                }
                if(seat.status != 0) {
                    bg_color = 'red';
                    text_color = 'aliceblue';
                    hint = '放手';
                    want = 0;
                } else {
                    bg_color = 'aqua';
                    text_color = 'black';
                    hint = '举手';
                    want = 1;
                }
                while(ii < seat.i) {
                    for(var k=0; k<=maxJ; ++k) {
                        ans.append("<td><div style='width: "+eachWidth+"px; height: "+eachWidth+"px; margin: 16px auto;'></div></td>");
                        ans.append("<td><div style='width: 5px; height: 5px;'></div></td>");
                    }
                    ans.append("</tr>");
                    ans.append("<tr>");
                    ii++;
                }
                // 空位补充
                while(jj < seat.j) {
                    ans.append("<td><div style='width: "+eachWidth+"px; height: "+eachWidth+"px;'></div></td>");
                    ans.append("<td><div style='width: 5px; height: 5px;'></div></td>");
                    jj++;
                }
                if(seat.i == ii && seat.j == jj) {
                    ans.append("<td><div id='"+seat.number+"' class='waves' title='"+hint+"' style='width: " +eachWidth+ "px; height: " +eachWidth+ "px; line-height: " +eachWidth+ "px; margin: 16px auto; background-color: " +bg_color+ "; text-align: center; font-weight: 600; color: " +text_color+ "; cursor: pointer;' value='"+want+"'; onclick='updateHand($(this).attr(\"value\"), $(this).text(), event)' >"+seat.number+"</div></td>");
                    ans.append("<td><div style='width: 5px; height: 5px;'></div></td>");
                    jj++;
                    lastJ = seat.j;
                }
            });
            ans.append("</tr>");
            $("#content").html("");
            $("#content").html(ans.toString());
        },
        error: function(result, err, ex) {
            console.info(result);
            console.info(err);
            console.info(ex);
            window.clearInterval(task);
            toastr.error("发生异常，加载错误，请刷新页面重试！");
        }
    });
}

// 校验输入的机位号是否合法
function validateNumber(number) {
    if(number == '') return "输入机位号为空！";
    number = number.toUpperCase();
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
    if($("#"+number).length == 0) return "输入机位号不存在！";
    return "validate_passed";
}

// 举手或放手操作，status为0执行放手，为1执行举手
function updateHand(status, number, event) {
    if(event) showWaves(event);
    // 前端输入校验
    var msg = validateNumber(number);
    if(msg != "validate_passed") {
        toastr.error(msg);
        return ;
    }
    if(status != 0 && handupTimer > 0) {toastr.error("2分钟内只能举一次手！还需等待"+handupTimer+"秒！"); return;}
    if(status == 0 && handdownTimer > 0) {toastr.error("2分钟内只能放一次手！还需等待"+handdownTimer+"秒"); return;}
    if($("#"+number).attr('value') == status) {
        if(status == 0) handdownTimer = waitTime;
        else handupTimer = waitTime;
        processProgress();
        $.ajax({
            url : "/updateHandStatus",
            type: "post",
            data: {"number": number, "status": status},
            dataType:"json",
            success: function(result, _status, _xhr) {
                if(result.success == "success") {
                    if(status == 0) {
                        // 修改页面显示
                        $("#"+number)[0].title = "举手";
                        $("#"+number)[0].attributes.value.value = 1;
                        $("#"+number)[0].style.backgroundColor = "aqua";
                        $("#"+number)[0].style.color = "black";
                        toastr.success("放手成功！");
                    }
                    else {
                        // 修改页面显示
                        $("#"+number)[0].title = "放手";
                        $("#"+number)[0].attributes.value.value = 0;
                        $("#"+number)[0].style.backgroundColor = "red";
                        $("#"+number)[0].style.color = "aliceblue";
                        toastr.success("举手成功！");
                    }
                } else toastr.error("发生异常！");
            },
            error: function(result, err, ex) {
                console.info(result);
                console.info(err);
                console.info(ex);
                toastr.error("发生异常！");
            }
        });
    } else if(status == 0) toastr.error("已放手！");
    else toastr.error("已举手！");
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