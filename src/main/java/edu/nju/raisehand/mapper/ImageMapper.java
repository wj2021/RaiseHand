package edu.nju.raisehand.mapper;

import java.util.List;

import edu.nju.raisehand.model.Image;

/* 
 * 建数据库语句
 * create database raisehand;
 * 建表语句
   CREATE TABLE raisehand.`image` (
    `id` varchar(255) NOT NULL,
    `path` varchar(255) NOT NULL,
    `cwd` varchar(255) NOT NULL,
    `name` varchar(255),
    `orign_name` varchar(255),
    // `height` int,
    // `width` int,
    `time` DATETIME NOT NULL,
    PRIMARY KEY (`id`)
   );
*/

public interface ImageMapper {
    // 插入图片
    int insertPic(Image img);
    // 删除图片
    int deletePic(String id);
    int deletePicByName(String name);
    // 获取所有图片
    List<Image> getAllPics();
    // 获取所有图片名字
    List<String> getAllPicsName();
}
