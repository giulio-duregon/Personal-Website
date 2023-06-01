package com.giulioduregon.www;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/*
 * As the webpage is rather simple, we only need to define a single
 * controller class and route our traffic to different pages / views.
 * */
@Controller
public class HomeController {
    @RequestMapping("/")
    public String index() {
        return "index.html";
    }

    @RequestMapping("/work-experience")
    public String work_experience() {
        return "work-experience.html";
    }

    @RequestMapping("/projects")
    public String projects() {
        return "projects.html";
    }
    
}
