package top.junbaba.webchat.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import top.junbaba.webchat.EscapeUnescape;
import top.junbaba.webchat.Now;
import top.junbaba.webchat.entity.Message;
import top.junbaba.webchat.entity.Userinfo;
import top.junbaba.webchat.repositories.MessageRepository;
import top.junbaba.webchat.repositories.UserinfoRepository;
import top.junbaba.webchat.websocket.WebSocketServer_chat;
import top.junbaba.webchat.websocket.WebSocket_login;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
public class Chatcontroller {
    @Autowired
    private UserinfoRepository userinfoRepository;
    @Autowired
    private MessageRepository messageRepository;

    @PostMapping("/getAllUsers")
    public List<String> getAllUsers(){
        List<String> list = new ArrayList<>();
        List<Userinfo> userinfos = userinfoRepository.findAll();
        for(Userinfo userinfo:userinfos){
            list.add(userinfo.getAccount());
        }
        return list;
    }
    @PostMapping("/getAllOnlineUsers")
    public List<String> getAllOnlineUsers(){

        return WebSocket_login.getLoginUserid();
    }

    @PostMapping("/chatting")     //聊天室发消息
    @ResponseBody
    public void chatting(@RequestParam("message")String msg,
                         @RequestParam("userid")String uid){
        try {
            Message message = new Message(uid,msg);
            message.setTime(Now.getNowTime("yyyy-MM-dd HH:mm:ss"));
            messageRepository.save(message);
            WebSocketServer_chat.sendInfo(message.toString());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    @PostMapping("/chatOne")     //私聊
    @ResponseBody
    public void chatOne(@RequestParam("message")String msg,
                         @RequestParam("userid")String userid,
                         @RequestParam("touser")String touser
                        ){
        try {
            Message message = new Message(userid,touser,msg);
            message.setTime(Now.getNowTime("yyyy-MM-dd HH:mm:ss"));
            messageRepository.save(message);
            WebSocket_login.sendOneLoginedMen(userid,touser,message.toUser());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    @PostMapping("/getMessages")
    @ResponseBody
    public List<Message> getMessages(@RequestParam("a")int a,
                                     @RequestParam("b")int b){
        return messageRepository.getAllMessages(a,b);
    }
    @PostMapping("/getMessage")
    @ResponseBody
    public List<Message> getMessages(@RequestParam("userid")String userid,
                                     @RequestParam("touser")String touser,
                                     @RequestParam("a")int a,
                                     @RequestParam("b")int b){
        return messageRepository.getMessages(userid,touser,a,b);
    }
}
