package edu.nju.raisehand;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@MapperScan("edu.nju.raisehand.mapper")
@SpringBootApplication
public class RaiseHandMainApplication {
    public static void main(String[] args) {
        SpringApplication.run(RaiseHandMainApplication.class,args);
    }
}