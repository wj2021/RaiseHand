package edu.nju.raisehand.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class IndexController {

    @RequestMapping("/index")
    public String index() {
        return "index";
    }

    @RequestMapping("/indexTA")
    public String indexTA() {
        return "indexTA";
    }

    @RequestMapping("__admin__")
    public String admin() {
        return "admin";
    }

    @RequestMapping(value="/updateSeat")
    public String updateSeat() {
        return "updateSeat";
    }

    @RequestMapping("handStatistics")
    public String handStatistics() {
        return "handStatistics";
    }

}

