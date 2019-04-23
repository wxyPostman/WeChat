package top.junbaba.webchat.websocket;

import org.springframework.stereotype.Component;
import top.junbaba.webchat.entity.Userinfo;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArraySet;

@ServerEndpoint(value = "/websocket_login/{userid}")
@Component
public class WebSocket_login {
    //静态变量，用来记录当前在线连接数。应该把它设计成线程安全的。

    private static int onlineCount = 0;

    //concurrent包的线程安全Set，用来存放每个客户端对应的MyWebSocket对象。

    private static CopyOnWriteArraySet<WebSocket_login> webSocketSet = new CopyOnWriteArraySet<WebSocket_login>();

    public static CopyOnWriteArraySet<WebSocket_login> getWebSocketSet() {
        return webSocketSet;
    }

//与某个客户端的连接会话，需要通过它来给客户端发送数据

    private Session session;
    private String userid;

    public String getUserid() {
        return userid;
    }
    public void letHeLoginOut(String userid){
        for (WebSocket_login item : webSocketSet) {
            if(item.userid.equals(userid)) {
                try {
                    item.sendMessage("{\"type\":\"logined\",\"msg\":\"该账号在别处已登录\"}");
                } catch (IOException e) {
                    e.printStackTrace();
                }
                break;
            }
        }

    }



    /**

     * 连接建立成功调用的方法*/

    @OnOpen

    public void onOpen(@PathParam("userid") String userid, Session session) {
        if (getLoginUserid(userid)>0){
            letHeLoginOut(userid);
        }
        this.session = session;
        this.userid = userid;
        webSocketSet.add(this);     //加入set中

        addOnlineCount();           //在线数加1
        //        System.out.println("有新连接加入！当前在线人数为" + getOnlineCount());
        try {

            sendInfo("{\"type\":\"loginin\",\"msg\":\""+String.valueOf(getOnlineCount())+"\"}");

        } catch (IOException e) {

            System.out.println("websocket IO异常");

        }

    }

    //	//连接打开时执行

    //	@OnOpen

    //	public void onOpen(@PathParam("user") String user, Session session) {

    //		currentUser = user;

    //		System.out.println("Connected ... " + session.getId());

    //	}



    /**

     * 连接关闭调用的方法

     */

    @OnClose

    public void onClose() {
        webSocketSet.remove(this);  //从set中删除

        subOnlineCount();           //在线数减1
        try {
            sendInfo("{\"type\":\"loginout\",\"msg\":\""+String.valueOf(getOnlineCount())+"\"}");
        } catch (IOException e) {
            e.printStackTrace();
        }
//        System.out.println("有一连接关闭！当前在线人数为" + getOnlineCount());

    }



    /**

     * 收到客户端消息后调用的方法

     *

     * @param message 客户端发送过来的消息*/

    @OnMessage

    public void onMessage(String message, Session session) {
//        System.out.println("来自客户端的消息:" + message);
        try {
            sendInfo("3."+message);
        } catch (IOException e) {
            e.printStackTrace();
        }

    }



    /**

     *

     * @param session

     * @param error

     */

    @OnError

    public void onError(Session session, Throwable error) {

        error.printStackTrace();

    }





    public void sendMessage(String message) throws IOException {

        this.session.getBasicRemote().sendText(message);

    }
    /**

     * 群发自定义消息

     * */

    public static void sendInfo(String message) throws IOException {

        for (WebSocket_login item : webSocketSet) {

            try {

                item.sendMessage(message);

            } catch (IOException e) {

                continue;

            }

        }

    }
    public static void sendOneLoginedMen(String userid,String touser,String message){
        for (WebSocket_login item : webSocketSet) {
            if(item.userid.equals(touser)||item.userid.equals(userid)) {
                try {
                    item.sendMessage(message);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
    public static List<String> getLoginUserid(){
        List<String> list = new ArrayList<>();
        for (WebSocket_login item : webSocketSet) {
            list.add(item.userid);
        }
        return list;
    }
    public static int getLoginUserid(String userid){
        int count = 0;
        for (WebSocket_login item : webSocketSet) {
            if(item.userid.equals(userid)) {
                count++;
            }
        }
        return count;
    }
    public static synchronized int getOnlineCount() {

        return onlineCount;

    }



    public static synchronized void addOnlineCount() {

        WebSocket_login.onlineCount++;

    }



    public static synchronized void subOnlineCount() {

        WebSocket_login.onlineCount--;

    }
}