package edu.nju.raisehand;

import javax.servlet.MultipartConfigElement;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.unit.DataSize;

@MapperScan("edu.nju.raisehand.mapper")
@SpringBootApplication
@Configuration
public class RaiseHandMainApplication {
    public static void main(String[] args) {
        SpringApplication.run(RaiseHandMainApplication.class, args);
    }

    @Value("${spring.servlet.multipart.max-request-size}")
    private String maxRequestFileSize;
    @Value("${spring.servlet.multipart.max-file-size}")
    private String maxFileSize;

    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        DataSize fileSize = DataSize.ofMegabytes(string2int(maxFileSize));
        DataSize requestSize = DataSize.ofMegabytes(string2int(maxRequestFileSize));
        // 允许上传的单个文件最大值
        factory.setMaxFileSize(fileSize);
        /// 允许一次请求上传数据的最大值
        factory.setMaxRequestSize(requestSize);
        return factory.createMultipartConfig();
    }

    private int string2int(String s) {
        int ans = 0;
        int order = 1;
        for (char c : s.toCharArray()) {
            if ('0' <= c && c <= '9') {
                ans = ans*order + (c-'0');
                order *= 10;
            } else break;
        }
        return ans;
    }
}