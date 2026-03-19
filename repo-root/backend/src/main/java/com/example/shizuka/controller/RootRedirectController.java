package com.example.shizuka.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class RootRedirectController {

    @GetMapping("/")
    public String redirectToSite() {
        return "redirect:https://202510-aw-sugihara.github.io/Project-Kaori/repo-root/site/admin.html";
    }
}
