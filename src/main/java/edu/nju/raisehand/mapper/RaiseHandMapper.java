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
    int insertSeat(RaiseHand hand);
    int deleteSeatByNumber(@Param("number")String number);
    int updateSeat(@Param("number")String number, @Param("status")int status);
    List<RaiseHand> getAllSeats();
    int deleteAllSeats();
    int getMaxJ();
}