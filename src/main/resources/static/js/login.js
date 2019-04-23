
function login() {
    var account = $('#account').val().trim();
    var password = $('#password').val().trim();

    if(account.length<=0){
        alert("请输入账号");
        $('#account').focus();
    }else if(password.length<=0){
        alert("请输入密码");
        $('#password').focus();
    }else{
        var userinfo = {
            account:account,
            password:password
        };
        $.ajax({
            type:"post",
            url:"/loginwithpassword",
            data:userinfo,
            datatype:"text",
            success:function (data) {
                if(data.length>0){
                    location.href = "index";
                }else{
                    alert("账号或密码错误");
                }
            },
            error:function () {
                alert("登录失败");
            }
        })
    }
}
$(document).ready(function () {
    $("#input_user_name").focus(function(){
        $("#add_user_name").addClass("focus_border");
    })
    $("#input_user_name").blur(function(){
        $("#add_user_name").removeClass("focus_border");
    })

    $("#input_user_paw").focus(function(){
        $("#add_user_paw").addClass("focus_border");
    })
    $("#input_user_paw").blur(function(){
        $("#add_user_paw").removeClass("focus_border");
    })
    $('#loginbtn').click(function () {
        login();
    })
    $('input').keydown(function (event) {
        if (event.keyCode == 13) {
            event.returnvalue = false;
            $('#loginbtn').click();
            return false;
        }
    })
})