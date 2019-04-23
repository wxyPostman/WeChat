package top.junbaba.webchat.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Entity
public class Message {
    @Id
    @GeneratedValue
    private Integer id;
    private String userid;
    private String touser;
    @Column(length = 10000)
    private String message;
    private String time;

    public String getUserid() {
        return userid;
    }

    public void setUserid(String userid) {
        this.userid = userid;
    }

    public String getTouser() {
        return touser;
    }

    public void setTouser(String touser) {
        this.touser = touser;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    @Override
    public String toString() {
        return "{\"type\":\"chatting\",\"name\":\""+userid+"\",\"msg\":\""+message+"\",\"time\":\""+time+"\"}";
    }

    public String toUser() {
        return "{\"type\":\"chatone\",\"touser\":\""+touser+"\",\"name\":\""+userid+"\",\"msg\":\""+message+"\",\"time\":\""+time+"\"}";
    }
    public Message() {
    }

    public Message(String userid, String message) {
        this.userid = userid;
        this.message = message;
    }

    public Message(String userid, String touser, String message) {
        this.userid = userid;
        this.touser = touser;
        this.message = message;
    }
}
