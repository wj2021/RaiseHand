package edu.nju.raisehand.controller;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
// import javax.validation.Valid;
// import javax.validation.constraints.NotNull;
// import org.hibernate.validator.constraints.Length;
// import org.hibernate.validator.constraints.NotBlank;
// import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import edu.nju.raisehand.mapper.RaiseHandMapper;
import edu.nju.raisehand.model.RaiseHand;

@Validated // 开启数据校验，添加在类上用于校验方法，添加在方法参数中用于校验参数对象。(添加在方法上无效)
@RestController
public class RaiseHandController {
    @Autowired
    private RaiseHandMapper raiseHandMapper;

    @RequestMapping(value="/getAllSeats", method = RequestMethod.POST)
    @Transactional
    public Map<String, Object> getAllSeats() {
        List<RaiseHand> hands = raiseHandMapper.getAllSeats();
        Collections.sort(hands);
        int maxJ = raiseHandMapper.getMaxJ();
        Map<String, Object> ans = new HashMap<>();
        ans.put("maxJ", maxJ);
        ans.put("data", hands);
        return ans;
    }

    @RequestMapping(value="/insertSeat", method = RequestMethod.POST)
    @Transactional
    public Map<String, String> insertSeat(String number, int i, int j) {
        RaiseHand raiseHand = new RaiseHand();
        raiseHand.setNumber(number);
        raiseHand.setI(i);
        raiseHand.setJ(j);
        raiseHandMapper.insertSeat(raiseHand);

        Map<String, String> result = new HashMap<>();
        result.put("success", "success");
        result.put("res", raiseHand.toString());
        return result;
    }

    @RequestMapping(value="/deleteSeat", method = RequestMethod.POST)
    @Transactional
    public Map<String, String> deleteSeat(String number) {
        raiseHandMapper.deleteSeatByNumber(number);
        Map<String, String> result = new HashMap<>();
        result.put("success", "success");
        return result;
    }

    @RequestMapping(value="/updateHandStatus", method = RequestMethod.POST)
    @Transactional
    public Map<String, String> updateHandStatus(String number, int status) {
        Map<String, String> res = new HashMap<>();
        try {
            raiseHandMapper.updateSeat(number, status); 
            res.put("success", "success");
        } catch (Exception e) {
            res.put("success", "fail");
        }
        return res;
    }

    // 按照实验楼乙224的座位初始化座位A1~A105和B1~B104
    @RequestMapping(value="/initSeat", method = RequestMethod.POST)
    @Transactional
    public Map<String, String> initSeat() {
        raiseHandMapper.deleteAllSeats();
        int count = 1;
        int direction = 1; // 1右，-1左
        int row = 0, col = 0;
        // 插入A1~A99
        RaiseHand raiseHand = new RaiseHand();
        for(int k=1; k<=99; ++k) {
            raiseHand.setHand(count++, "A"+k, row, col);
            raiseHandMapper.insertSeat(raiseHand);
            if(col == 0 || col == 9) {
                if(col != 0 || row != 0) {
                    row++;
                    k++;
                    if(k <= 99) {
                        raiseHand.setHand(count++, "A"+k, row, col);
                        raiseHandMapper.insertSeat(raiseHand);
                    }
                    if(col == 9) direction = -1;
                    if(col == 0) direction = 1;
                }
            }
            col += direction;
        }
        // 插入A100~A105
        raiseHand.setHand(count++, "A"+100, 9, 10);
        raiseHandMapper.insertSeat(raiseHand);
        for(int k=1; k<=5; ++k) {
            raiseHand.setHand(count++, "A10"+k, k+3, 10);
            raiseHandMapper.insertSeat(raiseHand);
        }

        // 插入B1~B100
        row = 0; col = 20;
        direction = -1;
        for(int k=1; k<=100; ++k) {
            raiseHand.setHand(count++, "B"+k, row, col);
            raiseHandMapper.insertSeat(raiseHand);
            if(col == 11 || col == 20) {
                if(row != 0 || col != 20) {
                    row++;
                    k++;
                    if(k <= 100) {
                        raiseHand.setHand(count++, "B"+k, row, col);
                        raiseHandMapper.insertSeat(raiseHand);
                    }
                    if(col == 11) direction = 1;
                    if(col == 20) direction = -1;
                }
            }
            col += direction;
        }

        // 插入B101~104
        for(int k=1; k<=4; ++k) {
            raiseHand.setHand(count++, "B10"+k, k-1, 10);
            raiseHandMapper.insertSeat(raiseHand);
        }
        Map<String, String> ans = new HashMap<>();
        ans.put("success", "success");
        return ans;
    }

    // @RequestMapping("/hello")
    // public String hello(@Validated @RequestBody User user,
    //                     BindingResult bindingResult) {
    //     if(bindingResult.hasErrors())
    //         return bindingResult.getAllErrors().get(0).getDefaultMessage();
    //     return "hello "+user.toString();
    // }

    // @RequestMapping("/hello1")
    // public String hello1(@NotBlank(message = "用户名字不能为空")
    //                      @Length(min = 2, max = 10, message = "用户名长度必须在 2 - 10 之间")
    //                      @RequestParam("userName") String userName) throws Exception {
    //     return "hello "+ userName;
    // }

    // @RequestMapping("/user/addUser")
    // public int addUser(@RequestBody User user){
    //     userMapper.addUser(user);
    //     return user.getUserId();
    // }

    // @RequestMapping("/user/getUserInfo")
    // public List<User> getUserInfo(){
    //     return userMapper.getUserInfo();
    // }

    // @RequestMapping("/user/getUserById")
    // public User getUserInfo(int userId){
    //     return userMapper.getUserById(userId);
    // }

    // @RequestMapping("user/getUserInfoByNameAndPsd")
    // public User getUserInfo(String userName, String password) {
    //     return userMapper.getUserByNameAndPsd(userName, password);
    // }
}

