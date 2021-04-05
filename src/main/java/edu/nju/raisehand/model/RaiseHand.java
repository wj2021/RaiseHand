package edu.nju.raisehand.model;

// import org.hibernate.validator.constraints.Length;
// import org.hibernate.validator.constraints.NotBlank;
// import javax.validation.constraints.NotNull;
import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;


@JsonIgnoreProperties({"handler"})
public class RaiseHand implements Serializable, Comparable<RaiseHand> {
    private static final long serialVersionUID = 1L;

    private int id; // 主键
    // @NotBlank(message = "用户名字不能为空")
    // @Length(min = 2, max = 10, message = "用户名长度必须在 {min} - {max} 之间")
    private String number; // 机位号
    private int i; // 机位所在行号
    private int j; // 机位所在列号
    private int status; // 是否举手，0：放手，1：举手，2：举手被助教标记
    private int upcount; // 举手次数统计
    private int downcount; // 放手次数统计
    private String changetime; // 记录举手状态的变化时间

    public void setHand(int id, String number, int i, int j) {
        this.id = id;
        this.number = number;
        this.i = i;
        this.j = j;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public int getI() {
        return i;
    }

    public void setI(int i) {
        this.i = i;
    }

    public int getJ() {
        return j;
    }

    public void setJ(int j) {
        this.j = j;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public int getUpcount() {
        return upcount;
    }

    public void setUpcount(int upcount) {
        this.upcount = upcount;
    }

    public int getDowncount() {
        return downcount;
    }

    public void setDowncount(int downcount) {
        this.downcount = downcount;
    }

    public String getChangetime() {
        return changetime;
    }

    public void setChangetime(String changetime) {
        this.changetime = changetime;
    }

    @Override
    public String toString() {
        return "RaiseHand{" +
                "id=" + id +
                ", number='" + number + '\'' +
                ", i='" + i + '\'' +
                ", j=" + j +
                ", status=" + status +
                ", upcount=" + upcount +
                ", downcount=" + downcount +
                ", changetime=" + changetime +
                '}';
    }

    @Override
    public int compareTo(RaiseHand o) {
        if(this == null || o == null) return 0;
        if(this.i != o.i) return this.i-o.i;
        else return this.j - o.j;
    }
}
