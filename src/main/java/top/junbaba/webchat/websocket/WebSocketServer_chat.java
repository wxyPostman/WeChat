package top.junbaba.webchat.websocket;

import org.springframework.stereotype.Component;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.concurrent.CopyOnWriteArraySet;

@ServerEndpoint(value = "/websocket_chat/{userid}")
@Component
public class WebSocketServer_chat {
    //静态变量，用来记录当前在线连接数。应该把它设计成线程安全的。

    private static int onlineCount = 0;

    //concurrent包的线程安全Set，用来存放每个客户端对应的MyWebSocket对象。

    private static CopyOnWriteArraySet<WebSocketServer_chat> webSocketSet = new CopyOnWriteArraySet<WebSocketServer_chat>();

    public static CopyOnWriteArraySet<WebSocketServer_chat> getWebSocketSet() {
        return webSocketSet;
    }

//与某个客户端的连接会话，需要通过它来给客户端发送数据

    private Session session;
    private String userid;

    /**

     * 连接建立成功调用的方法*/

    @OnOpen

    public void onOpen(@PathParam("userid") String userid, Session session) {
        this.session = session;
        this.userid = userid;
        webSocketSet.add(this);     //加入set中

        addOnlineCount();           //在线数加1

        try {

            sendInfo("{\"type\":\"chatin\"," +
                    "\"count\":\""+String.valueOf(getOnlineCount())+"\"," +
                    "\"name\":\""+userid+"\"}");

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
            sendInfo("{\"type\":\"chatout\"," +
                    "\"count\":\""+String.valueOf(getOnlineCount())+"\"," +
                    "\"name\":\""+userid+"\"" +
                    "}");
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

        System.out.println("发生错误");

        error.printStackTrace();

    }





    public void sendMessage(String message) throws IOException {

        this.session.getBasicRemote().sendText(message);

    }
    /**

     * 群发自定义消息

     * */

    public static void sendInfo(String message) throws IOException {

//        System.out.println(message);

        for (WebSocketServer_chat item : webSocketSet) {

            try {

                item.sendMessage(message);

            } catch (IOException e) {

                continue;

            }

        }

    }

    public static synchronized int getOnlineCount() {

        return onlineCount;

    }



    public static synchronized void addOnlineCount() {

        WebSocketServer_chat.onlineCount++;

    }



    public static synchronized void subOnlineCount() {

        WebSocketServer_chat.onlineCount--;

    }
}
