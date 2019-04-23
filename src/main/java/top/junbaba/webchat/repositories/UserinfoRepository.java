package top.junbaba.webchat.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import top.junbaba.webchat.entity.Userinfo;

import javax.transaction.Transactional;

public interface UserinfoRepository extends JpaRepository<Userinfo,Integer> {
    public Userinfo findByAccount(String account);
    public Userinfo findByAccountAndPassword(String account,String password);

    @Modifying
    @Transactional
    @Query("update Userinfo u set u.password=?2 where u.account=?1")
    public void changepassword(String account, String password);
}
