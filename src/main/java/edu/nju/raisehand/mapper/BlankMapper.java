package edu.nju.raisehand.mapper;
import java.util.List;

/* 
 * 建表语句
   CREATE TABLE raisehand.`blank` (
    `id` int unsigned NOT NULL,
    `row_nums` varchar(255),
    `col_nums` varchar(255),
    PRIMARY KEY (`id`)
   );
*/

public interface BlankMapper {
    // 查询空白, axis: 0(查询行空白), 1(查询列空白)
    List<String> queryBlanks(int axis);
    // 修改空白
    int updateBlanks(String row_nums, String col_nums);
    // 插入空白
    int insertBlanks(String row_nums, String col_nums);
    // 删除空白
    int deleteBlanks();
}