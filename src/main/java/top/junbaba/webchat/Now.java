package top.junbaba.webchat;


import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Created by asus on 2017/3/11.
 */
public class Now {
    public static String getNowTime(String time){
        Date date = new Date();
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(time);
        return simpleDateFormat.format(date);
    }
}
