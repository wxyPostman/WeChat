package top.junbaba.webchat.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import top.junbaba.webchat.Now;
import top.junbaba.webchat.entity.Userinfo;
import top.junbaba.webchat.repositories.UserinfoRepository;

import javax.servlet.http.HttpSession;

@RestController
public class Maincontroller {
    @Autowired
    private UserinfoRepository userinfoRepository;

    @PostMapping("/loginwithpassword")
    public String loginwithpassword(Userinfo userinfo,
                                    HttpSession session){
        if(userinfoRepository.findByAccountAndPassword(userinfo.getAccount(),userinfo.getPassword())!=null){
            session.setAttribute("user_account",userinfo.getAccount());
            return userinfo.getAccount();
        }
        return "";
    }
    @PostMapping("/getLogin")
    public String getLogin(HttpSession session){
        return (String)session.getAttribute("user_account");
    }
    @PostMapping("/exitLogin")
    public void exitLogin(HttpSession session){
        session.removeAttribute("user_account");
    }

    @PostMapping("/adduser")
    public String adduser(Userinfo userinfo){
        if(userinfoRepository.findByAccount(userinfo.getAccount())!=null){
            return "该账号已被注册";
        }
        userinfoRepository.save(userinfo);
        return "注册成功";
    }
    @PostMapping("/changepassword")
    public String changepassword(@RequestParam("password") String password,
                                 HttpSession session){
        String account = (String)session.getAttribute("user_account");
        if(account==null){
            return "修改失败,请先登录";
        }
        userinfoRepository.changepassword(account,password);
        return "修改成功";
    }
}
