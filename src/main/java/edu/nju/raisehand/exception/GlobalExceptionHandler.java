package edu.nju.raisehand.exception;

import org.apache.tomcat.util.http.fileupload.impl.FileSizeLimitExceededException;
import org.apache.tomcat.util.http.fileupload.impl.SizeLimitExceededException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.ModelAndView;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;

@ControllerAdvice
public class GlobalExceptionHandler {
    @Value("${spring.servlet.multipart.max-file-size}")
    private String maxFileSize;

    @ExceptionHandler(value = ConstraintViolationException.class)
    public ResponseEntity<String> constraintViolationExceptionHandler(ConstraintViolationException e) {
        return ResponseEntity.badRequest().body(e.getConstraintViolations().stream()
                .map(ConstraintViolation::getMessageTemplate).findFirst().orElse(e.getMessage()));
    }

    /**
     * 处理文件上传大小超限制
     * 
     * @param exception
     * @return Object
     */
    @ExceptionHandler(value = MultipartException.class)
    @ResponseBody
    public Object fileUploadExceptionHandler(MultipartException exception) {
        Map<String, Object> map = new HashMap<>();
        map.put("success", "fail");
        String msg = null;
        if (exception.getRootCause() instanceof FileSizeLimitExceededException) {
            msg = "图片过大！[上传图片大小不得超过" + maxFileSize + "]";
        } else if (exception.getRootCause() instanceof SizeLimitExceededException) {
            msg = "图片过大！[上传图片大小不得超过" + maxFileSize + "]";
        } else {
            msg = "图片上传失败[服务器异常]";
        }
        map.put("msg", msg);
        return map;
    }

    /**
     * 捕获全局异常，处理所有不可知的异常
     * 
     * @param exception
     * @return Object
     */
    @ExceptionHandler(value = Exception.class)
    @ResponseBody
    public Object handleException(Exception e, HttpServletRequest request) {
        // 如果是ajax请求返回json数据，否则返回错误页面
        if (isAjax(request)) {
            e.printStackTrace();
            Map<String, Object> map = new HashMap<>();
            map.put("success", "fail");
            map.put("msg", "发生异常，异常信息为: " + e.getMessage());
            // 未选择文件
            if (e instanceof MissingServletRequestPartException) {
                map.put("msg", "未选择文件！");
            }
            return map;
        } else {
            ModelAndView model = new ModelAndView();
            model.setViewName("error403");
            return model;
        }
    }

    // 判断是不是ajax请求
    private static boolean isAjax(HttpServletRequest request) {
        return request.getHeader("X-Requested-With") != null
                && "XMLHttpRequest".equals(request.getHeader("X-Requested-With").toString());
    }
}
