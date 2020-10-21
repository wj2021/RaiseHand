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

    @RequestMapping(value="/updateSeat")
    public String updateSeat() {
        return "updateSeat";
    }

}

