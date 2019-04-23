package top.junbaba.webchat;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import top.junbaba.webchat.controller.Maincontroller;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = WebchatApplication.class, webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
public class WebchatApplicationTests {

    @Test
    public void contextLoads() {

    }

}

