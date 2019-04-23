package top.junbaba.webchat.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import top.junbaba.webchat.entity.Message;

import javax.transaction.Transactional;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message,Integer> {

    @Modifying
    @Transactional
    @Query(nativeQuery = true, value ="select * from message where touser is null order by time desc limit ?1,?2 ")
    public List<Message> getAllMessages(int a,int b);

    @Modifying
    @Transactional
    @Query(nativeQuery = true, value ="select * from message where (touser=?1 and userid=?2) or (touser=?2 and userid=?1) order by time desc limit ?3,?4 ")
    public List<Message> getMessages(String userid,String touser,int a,int b);
}
