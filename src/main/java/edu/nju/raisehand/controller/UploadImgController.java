package edu.nju.raisehand.controller;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import edu.nju.raisehand.mapper.ImageMapper;
import edu.nju.raisehand.model.Image;

@RestController
public class UploadImgController {
    @Value("${user.file.save-path}")
    private String imgRootPath;

    @Autowired
    private ImageMapper imageMapper;

    // 允许上传的文件后缀
    // xbm|tif|pjp|svgz|jpg|jpeg|ico|tiff|gif|svg|jfif|webp|png|bmp|pjpeg|avif
    private static final Set<String> fileSuffixs = new HashSet<>() {
        private static final long serialVersionUID = 1L;
        {
            add(".xbm");
            add(".tif");
            add(".pjp");
            add(".svgz");
            add(".jpg");
            add(".jpeg");
            add(".ico");
            add(".tiff");
            add(".gif");
            add(".svg");
            add(".jfif");
            add(".webp");
            add(".png");
            add(".bmp");
            add(".pjpeg");
            add(".avif");
        }
    };

    // 获取所有图片的名称
    @RequestMapping(value = "/getAllPicsName", method = RequestMethod.POST)
    public Map<String, Object> getAllPicsName() {
        List<String> picNames = imageMapper.getAllPicsName();
        Map<String, Object> result = new HashMap<>();
        result.put("success", "success");
        result.put("data", picNames);
        return result;
    }

    // 删除指定名称的图片
    @RequestMapping(value = "/deletePicByName", method = RequestMethod.POST)
    public Map<String, Object> deletePicByName(String picName) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", "success");
        try {
            // 从数据库中删除记录
            int res = imageMapper.deletePicByName(picName);
            if (res > 0) {
                // 从服务器中删除文件本身
                File file = new File(imgRootPath + picName);
                if (file.isFile() && file.exists()) {
                    file.delete();
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", "fail");
        }
        return result;
    }

    // 上传文件
    @RequestMapping(value = "/upload", method = RequestMethod.POST)
    public Map<String, String> upload(@RequestParam("pic") MultipartFile pic) {
        Map<String, String> result = new HashMap<>();
        result.put("success", "success");
        try {
            String id = getUUID();
            String name = pic.getOriginalFilename();
            int idx = name.lastIndexOf(".");
            String suffix = name.substring(idx);
            // 检验文件后缀
            if (!fileSuffixs.contains(suffix)) {
                result.put("success", "fail");
                result.put("msg", "仅支持上传图片！");
                return result;
            }
            // 保存图片到本地目录
            String savedFileName = id + suffix;
            File file = new File(imgRootPath + savedFileName);
            pic.transferTo(file);

            // 图片路径保存到数据库
            Image img = new Image(id, imgRootPath + savedFileName, imgRootPath, savedFileName,
                    pic.getOriginalFilename());
            imageMapper.insertPic(img);
        } catch (IOException e) {
            e.printStackTrace();
            result.put("success", "fail");
            result.put("msg", e.getMessage());
        }
        return result;
    }

    private String getUUID() {
        UUID uuid = UUID.randomUUID();
        String id = uuid.toString();

        // 去掉随机ID的短横线
        id = id.replace("-", "");

        // // 将随机ID换成数字
        // int num = id.hashCode();
        // // 去绝对值
        // num = num < 0 ? -num : num;

        // id = String.valueOf(num);

        return id;
    }

}