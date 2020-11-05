/* 
 * 建数据库语句
 * create database raisehand;
 * 建表语句
   CREATE TABLE `raisehand` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `number` varchar(100) NOT NULL,
    `i` int NOT NULL,
    `j` int NOT NULL,
    `status` int NOT NULL DEFAULT '0',
    `upcount` int NOT NULL DEFAULT '0',
    `downcount` int NOT NULL DEFAULT '0',
    PRIMARY KEY (`id`),
    UNIQUE KEY `number` (`number`)
   );
*/

package edu.nju.raisehand.mapper;

import edu.nju.raisehand.model.RaiseHand;
import org.apache.ibatis.annotations.Param;
import java.util.List;

public interface RaiseHandMapper {
  // 插入一个机位
  int insertSeat(RaiseHand hand);
  // 根据number删除机位
  int deleteSeatByNumber(@Param("number")String number);
  // 更新机位状态
  int updateSeat(@Param("number")String number, @Param("status")int status);
  // 获取所有机位信息
  List<RaiseHand> getAllSeats();
  // 删除所有机位
  int deleteAllSeats();
  // 获取机位中最大的列号
  int getMaxJ();
  // 根据number获取机位信息
  List<RaiseHand> getSeatByNumber(@Param("number")String number);
}