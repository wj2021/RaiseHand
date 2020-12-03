$(function () {
    toastr.options.timeOut = 3000;
    getAllPicsName();
});

function getAllPicsName() {
    var ans = new StringBuffer();
    $.ajax({
        url: "/getAllPicsName",
        type: "post",
        data: null,
        dataType: "json",
        success: function (result, _status, _xhr) {
            if (result.success == "success") {
                ans.append("<ul>");
                var host = window.location.protocol + "//" + window.location.host;
                $.each(result.data, function (_i, imgName) {
                    var link = host + "/" + imgName;
                    ans.append("<li><div class='deatil'>" +
                        "<a href='/" + imgName + "' target='_blank' style='margin-top: 20px;'>查看原图</a>" +
                        "<div class='my_button waves copybtn' data-clipboard-text='" + link + "' style='display: block; height: 50px; line-height: 50px; margin: 20px auto;' onclick='showWaves(event)'>复制链接</div>" +
                        "<div class='my_button waves' style='display: block; height: 50px; line-height: 50px; margin: 0 auto; color: #fff; background-color: #F00;' onclick='deletePic(\"" + imgName + "\", event)'>删除图片</div>" +
                        "</div>" +
                        "<img src='/" + imgName + "' /></li>");
                });
                ans.append("</ul>");
                $("#content").html();
                $("#content").html(ans.toString());
                // 粘贴到剪切板功能
                var clipboard = new ClipboardJS('.copybtn');
                clipboard.on('success', function (e) {
                    toastr.success("复制成功！");
                    e.clearSelection();
                });
                clipboard.on('error', function (e) {
                    toastr.success("复制失败！");
                });
            } else {
                toastr.error("发生异常，加载错误，请刷新页面重试！");
            }
        },
        error: function (_result, _status, _xhr) {
            toastr.error("发生异常，加载错误，请刷新页面重试！");
        }
    });
}

// 前端限制上传文件的类型和大小
function validateImg(img) {
    var fileName = img.name;
    fileName = fileName.toLowerCase();
    if (!/.(xbm|tif|pjp|svgz|jpg|jpeg|ico|tiff|gif|svg|jfif|webp|png|bmp|pjpeg|avif)$/.test(fileName)) {
        toastr.error("仅支持上传图片！");
        return false;
    }
    if (((img.size).toFixed(2)) >= (10 * 1024 * 1024)) {
        toastr.error("图片过大！[上传图片大小不得超过10MB]");
        return false;
    }
    return true;
}

// 上传图片
function imgUpload(event) {
    if (event) showWaves(event);
    var img = $('#pic')[0].files[0];
    if (!img) {
        toastr.error("未选择文件！");
        return;
    }
    if (!validateImg(img)) return ;
    var formData = new FormData();
    formData.append("pic", img);
    $.ajax({
        url: '/upload',
        dataType: 'json',
        type: 'post',
        async: false,
        data: formData,
        processData: false, // 使数据不做处理
        contentType: false, // 不要设置Content-Type请求头
        success: function (result) {
            if (result.success == 'success') {
                getAllPicsName();
                toastr.success('图片上传成功！');
            }
            if (result.success == 'fail') {
                toastr.error(result.msg);
            }
        },
        error: function (_response) {
            toastr.error("发生异常，请刷新页面重试！");
        }
    });
}

function deletePic(picName, event) {
    if (event) showWaves(event);
    $.ajax({
        url: '/deletePicByName',
        dataType: 'json',
        type: 'post',
        data: { "picName": picName },
        success: function (result) {
            if (result.success == 'success') {
                getAllPicsName();
                toastr.success('删除图片成功！');
            }
            if (result.success == 'fail') {
                toastr.error('删除图片失败！');
            }
        },
        error: function (_response) {
            toastr.error("发生异常，请刷新页面重试！");
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