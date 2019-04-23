var chatAllFlag = false;
var chatOneFlag = "";
var socket_login;
var socket_chat;
var loginedAlert = true;
var userid;
var chat_counts = 0;
function getLogin() {
    $.post("getLogin",function (user) {
        if(user.length<=0){
            alert("请先登录");
            location.href = "login";
            return ;
        }
        userid = user;
        $(".chat_head_user").text(userid);
        connectSocket();
    })
}
function connectSocket() {
    if('WebSocket' in window){
        socket_login = new WebSocket("ws://"+window.location.host+"/websocket_login/"+userid);
        socket_login.onmessage = function (msg) {
            var m = $.parseJSON(msg.data);
            if(m.type=="loginin"||m.type=="loginout"){
                $('.person_in span').text(m.msg);
                getAllOnlineUsers();
            }else if(m.type=="logined"){        //下线操作
                if(loginedAlert){
                    loginedAlert = false;
                    socket_login.close();
                    alert(m.msg);
                }
                location.href = 'login';
            }else if(m.type=="chatone"){
                if(m.name!=userid){
                    $('.chat_chatInfo2').append("<div class=\"chat_time_info clearfix\">\n" +
                        "                                <div class=\"chat_timer\"><span> "+m.time+" </span></div>\n" +
                        "                                <div class=\"chat_other clearfix\">\n" +
                        "                                    <!-- 别人的头像 -->\n" +
                        "                                    <div class=\"other_head\">\n" +
                        "                                        <img src=\"images/lch.png\" alt=\"user\" />\n" +
                        "                                    </div>\n" +
                        "                                    <!-- 名字 -->\n" +
                        "                                    <div class=\"chat_content\">\n" +
                        "                                        <div class=\"other_title\">"+m.name+"</div>\n" +
                        "                                        <div class=\"chat_other_text\">\n" +
                        "                                            <span>\n" +unescape(m.msg) +
                        "                                            </span>\n" +
                        "                                        </div>\n" +
                        "                                    </div>\n" +
                        "                                </div>\n" +
                        "                            </div>")
                }else{
                    $('.chat_chatInfo2').append("<div class=\"chat_time_info clearfix\">\n" +
                        "                                <div class=\"chat_timer\"><span>"+m.time+"</span></div>\n" +
                        "                                <div class=\"chat_me clearfix\">\n" +
                        "                                    <div class=\"me_head\">\n" +
                        "                                        <img src=\"images/user.jpg\" alt=\"user\" />\n" +
                        "                                    </div>\n" +
                        "                                    <!-- 名字 -->\n" +
                        "                                    <div class=\"chat_content_me\">\n" +
                        "                                        <div class=\"other_title_me\">我</div>\n" +
                        "                                        <div class=\"chat_me_text\">\n" +
                        "                                            <span>\n" +unescape(m.msg)+
                        "                                            </span>\n" +
                        "                                        </div>\n" +
                        "                                    </div>\n" +
                        "                                </div>\n" +
                        "                            </div>")
                }
            }
            $('.chat_chatInfo2').scrollTop(5000);
        }
    }
}
function getAllOnlineUsers() {
    $.ajax({
        type:"post",
        url:"/getAllOnlineUsers",
        datatype:"json",
        success:function (data) {
            $("#userlist").empty();
            $.ajax({
                type:"post",
                url:"/getAllUsers",
                datatype:"json",
                success:function (data2) {
                    for(var i=0;i<data2.length;i++){
                        if(data.indexOf(data2[i])==-1){
                            $("#userlist").append("<li class=\"user_li clearfix siliao\">\n" +
                                "                                <div class=\"message_user_img\">\n" +
                                "                                    <img src=\"images/user.jpg\" alt=\"...\">\n" +
                                "                                </div>\n" +
                                "                                <div class=\"message_title\">\n<b>" + data2[i] +
                                "                                </b></div>\n" +
                                "                            </li>");
                        }else {
                            $("#userlist").prepend("<li class=\"user_li clearfix siliao\">\n" +
                                "                                <div class=\"message_user_img\">\n" +
                                "                                    <img src=\"images/user.jpg\" alt=\"...\">\n" +
                                "                                </div>\n" +
                                "                                <div class=\"message_title\">\n<b>" + data2[i] +
                                "                                </b></div>\n" +
                                "                                <div class=\"user_status\">\n" +
                                "                                    在线\n" +
                                "                                </div>\n" +
                                "                            </li>");
                        }

                    }
                    $("#userlist").prepend("<li class=\"user_li clearfix qunliao\">\n" +
                        "                                <div class=\"message_user_img\">\n" +
                        "                                    <img src=\"images/qun.jpg\" alt=\"...\">\n" +
                        "                                </div>\n" +
                        "                                <div class=\"message_title\"  id='quntitle'>\n" +
                        "                                    群聊\n" +
                        "                                </div>\n" +
                        "                            </li>");
                    $(".user_li").click(function () {
                        $(".user_have").show()
                        $(".user_none").hide()
                    })
                    $("li.qunliao").click(function () {
                        $('#user_id').text("群聊室(当前:"+chat_counts+"人)")
                        $('.chat_chatInfo').show();
                        $('.chat_chatInfo2').hide();
                        $("#sendMsg2").hide();
                        $("#sendMsg").show();
                        if(!chatAllFlag){
                            chatting();
                            chatAllFlag = true;
                            getMessages(0,5);
                        }

                    })
                    $("li.siliao").click(function () {
                        $('.chat_chatInfo2').show();
                        $('.chat_chatInfo').hide();
                        $("#user_id").text($(this).find("b").text().trim());
                        $("#sendMsg").hide();
                        $("#sendMsg2").show();
                        if(chatOneFlag!=this.innerText){
                            $('.chat_chatInfo2').empty();
                            chatOneFlag = this.innerText;
                            getMessage(0,5);
                        }

                    })
                },
                error:function () {
                    alert("网络错误")
                }
            })

        },
        error:function () {
            alert("网络错误")
        }
    })
}
function chatting() {
    if('WebSocket' in window){
        socket_chat = new WebSocket("ws://"+window.location.host+"/websocket_chat/"+userid);
        socket_chat.onmessage = function (msg) {
            var m = $.parseJSON(msg.data);
            if(m.type=="chatin"){
                $('.chat_chatInfo').append("<p class='chat_timer'>"+m.name+" 进来了</p>");
                chat_counts = m.count;
                $('#user_id').text("群聊室(当前:"+chat_counts+"人)")
            }else if(m.type=="chatout"){
                $('.chat_chatInfo').append("<p class='chat_timer'>"+m.name+" 离开了</p>");
                chat_counts = m.count;
                $('#user_id').text("群聊室(当前:"+chat_counts+"人)")
            }

            else if(m.type=="chatting"){
                if(m.name!=userid){
                    $('.chat_chatInfo').append("<div class=\"chat_time_info clearfix\">\n" +
                        "                                <div class=\"chat_timer\"><span> "+m.time+" </span></div>\n" +
                        "                                <div class=\"chat_other clearfix\">\n" +
                        "                                    <!-- 别人的头像 -->\n" +
                        "                                    <div class=\"other_head\">\n" +
                        "                                        <img src=\"images/lch.png\" alt=\"user\" />\n" +
                        "                                    </div>\n" +
                        "                                    <!-- 名字 -->\n" +
                        "                                    <div class=\"chat_content\">\n" +
                        "                                        <div class=\"other_title\">"+m.name+"</div>\n" +
                        "                                        <div class=\"chat_other_text\">\n" +
                        "                                            <span>\n" +unescape(m.msg) +
                        "                                            </span>\n" +
                        "                                        </div>\n" +
                        "                                    </div>\n" +
                        "                                </div>\n" +
                        "                            </div>")
                }else{
                    $('.chat_chatInfo').append("<div class=\"chat_time_info clearfix\">\n" +
                        "                                <div class=\"chat_timer\"><span>"+m.time+"</span></div>\n" +
                        "                                <div class=\"chat_me clearfix\">\n" +
                        "                                    <div class=\"me_head\">\n" +
                        "                                        <img src=\"images/user.jpg\" alt=\"user\" />\n" +
                        "                                    </div>\n" +
                        "                                    <!-- 名字 -->\n" +
                        "                                    <div class=\"chat_content_me\">\n" +
                        "                                        <div class=\"other_title_me\">我</div>\n" +
                        "                                        <div class=\"chat_me_text\">\n" +
                        "                                            <span>\n" +unescape(m.msg)+
                        "                                            </span>\n" +
                        "                                        </div>\n" +
                        "                                    </div>\n" +
                        "                                </div>\n" +
                        "                            </div>")
                }
            }
            $('.chat_chatInfo').scrollTop(5000);
        }
    }
}


function chatAll() {
    chatting();
    $('.chatBox').show();
}

function getMessages(now_counts,next_counts) {
    $.ajax({
        type: "POST",
        url: "/getMessages",
        data:{
            a:now_counts,
            b:next_counts
        },
        dataType:"json",
        success: function (data) {
            $('.chat_chatInfo a').remove();
            var h1 = $('.chat_chatInfo').get(0).scrollHeight;
            for(var i=0;i<data.length;i++){
                now_counts++;
                if(data[i].userid!=userid){
                    $('.chat_chatInfo').prepend("<div class=\"chat_time_info clearfix\">\n" +
                        "                                <div class=\"chat_timer\"><span> "+data[i].time+" </span></div>\n" +
                        "                                <div class=\"chat_other clearfix\">\n" +
                        "                                    <!-- 别人的头像 -->\n" +
                        "                                    <div class=\"other_head\">\n" +
                        "                                        <img src=\"images/lch.png\" alt=\"user\" />\n" +
                        "                                    </div>\n" +
                        "                                    <!-- 名字 -->\n" +
                        "                                    <div class=\"chat_content\">\n" +
                        "                                        <div class=\"other_title\">"+data[i].userid+"</div>\n" +
                        "                                        <div class=\"chat_other_text\">\n" +
                        "                                            <span>\n" +unescape(data[i].message) +
                        "                                            </span>\n" +
                        "                                        </div>\n" +
                        "                                    </div>\n" +
                        "                                </div>\n" +
                        "                            </div>")
                }else{
                    $('.chat_chatInfo').prepend("<div class=\"chat_time_info clearfix\">\n" +
                        "                                <div class=\"chat_timer\"><span>"+data[i].time+"</span></div>\n" +
                        "                                <div class=\"chat_me clearfix\">\n" +
                        "                                    <div class=\"me_head\">\n" +
                        "                                        <img src=\"images/user.jpg\" alt=\"user\" />\n" +
                        "                                    </div>\n" +
                        "                                    <!-- 名字 -->\n" +
                        "                                    <div class=\"chat_content_me\">\n" +
                        "                                        <div class=\"other_title_me\">我</div>\n" +
                        "                                        <div class=\"chat_me_text\">\n" +
                        "                                            <span>\n" +unescape(data[i].message)+
                        "                                            </span>\n" +
                        "                                        </div>\n" +
                        "                                    </div>\n" +
                        "                                </div>\n" +
                        "                            </div>")
                }
            }
            if(data.length>=next_counts){
                $('.chat_chatInfo').prepend("<a href=javascript:getMessages("+now_counts+","+next_counts+")>查看历史消息</a>");
            }else {
                $('.chat_chatInfo a').remove();
                $('.chat_chatInfo').prepend("<p>没有更多记录了</p>");
            }
            var h2 = $('.chat_chatInfo').get(0).scrollHeight;
            $('.chat_chatInfo').scrollTop(h2-h1);
        }
    });
}
function getMessage(now_counts,next_counts) {
    $.ajax({
        type: "POST",
        url: "/getMessage",
        data:{
            userid:userid,
            touser:$('#user_id').text(),
            a:now_counts,
            b:next_counts
        },
        dataType:"json",
        success: function (data) {
            $('.chat_chatInfo2 a').remove();
            var h1 = $('.chat_chatInfo2').get(0).scrollHeight;
            for(var i=0;i<data.length;i++){
                now_counts++;
                if(data[i].userid!=userid){
                    $('.chat_chatInfo2').prepend("<div class=\"chat_time_info clearfix\">\n" +
                        "                                <div class=\"chat_timer\"><span> "+data[i].time+" </span></div>\n" +
                        "                                <div class=\"chat_other clearfix\">\n" +
                        "                                    <!-- 别人的头像 -->\n" +
                        "                                    <div class=\"other_head\">\n" +
                        "                                        <img src=\"images/lch.png\" alt=\"user\" />\n" +
                        "                                    </div>\n" +
                        "                                    <!-- 名字 -->\n" +
                        "                                    <div class=\"chat_content\">\n" +
                        "                                        <div class=\"other_title\">"+data[i].userid+"</div>\n" +
                        "                                        <div class=\"chat_other_text\">\n" +
                        "                                            <span>\n" +unescape(data[i].message) +
                        "                                            </span>\n" +
                        "                                        </div>\n" +
                        "                                    </div>\n" +
                        "                                </div>\n" +
                        "                            </div>")
                }else{
                    $('.chat_chatInfo2').prepend("<div class=\"chat_time_info clearfix\">\n" +
                        "                                <div class=\"chat_timer\"><span>"+data[i].time+"</span></div>\n" +
                        "                                <div class=\"chat_me clearfix\">\n" +
                        "                                    <div class=\"me_head\">\n" +
                        "                                        <img src=\"images/user.jpg\" alt=\"user\" />\n" +
                        "                                    </div>\n" +
                        "                                    <!-- 名字 -->\n" +
                        "                                    <div class=\"chat_content_me\">\n" +
                        "                                        <div class=\"other_title_me\">我</div>\n" +
                        "                                        <div class=\"chat_me_text\">\n" +
                        "                                            <span>\n" +unescape(data[i].message)+
                        "                                            </span>\n" +
                        "                                        </div>\n" +
                        "                                    </div>\n" +
                        "                                </div>\n" +
                        "                            </div>")
                }
            }
            if(data.length>=next_counts){
                $('.chat_chatInfo2').prepend("<a href=javascript:getMessage("+now_counts+","+next_counts+")>查看历史消息</a>");
            }else {
                $('.chat_chatInfo2 a').remove();
                $('.chat_chatInfo2').prepend("<p>没有更多记录了</p>");
            }
            var h2 = $('.chat_chatInfo2').get(0).scrollHeight;
            $('.chat_chatInfo2').scrollTop(h2-h1);
        }
    });
}
function exitLogin() {
    if(confirm("是否退出?")){
        $.post("exitLogin",function () {
            location.href = "login";
        });
    }

}
function sendAll(m) {
    $.post('/chatting',{message:m,userid:userid});
}
function sendOne(m,touser) {
    $.post('/chatOne',{message:m,userid:userid,touser:touser});
}
function zishiying(ww,hh){
    var w = window.innerWidth-410>ww?window.innerWidth-410:ww;
    var h = window.innerHeight-48>hh?window.innerHeight-48:hh;
    $(".box_chat").css("width",w+"px");
    $("body").css("height",h+"px");
}
$(document).ready(function () {
    getLogin();
    $('#user_out').click(function () {
        $('#user_out_menu').toggle('slow')
    })
    $('.user_li').click(function () {
        $('.user_have').show();
        $('.user_none').hide();
    })

    layui.use(["layedit"], function() {
        var layedit = layui.layedit;
        var ieditor = layedit.build("layeditDemo", {
            tool: [
                "face",
                "strong"
            ]
        });
        $("#sendMsg").click(function () {
            layedit.sync(ieditor);
            var m = $('#layeditDemo').val().trim();

            if (m.length > 0 && m != "<br>" && m.length <= 5000) {
                layedit.setContent(1, "");
                sendAll(escape(m));
            } else if (m.length > 5000) {
                alert("内容过多")
            }
        })
        $("#sendMsg2").click(function () {
            layedit.sync(ieditor);
            var m = $('#layeditDemo').val().trim();
            if (m.length > 0 && m != "<br>" && m.length <= 5000) {
                layedit.setContent(1, "");
                sendOne(escape(m), $("#user_id").text());
            } else if (m.length > 5000) {
                alert("内容过多")
            }
        })
    })
})