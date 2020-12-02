package edu.nju.raisehand.model;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties({ "handler" })
public class Image implements Serializable {

    private static final long serialVersionUID = 1L;

    private String id;
    private String path;
    private String cwd;
    private String name;
    private String orignName;
    private String time;

    public Image(String id, String path, String cwd, String name, String orignName) {
        this.id = id;
        this.path = path;
        this.cwd = cwd;
        this.name = name;
        this.orignName = orignName;
        this.time = "2020-12-11 12:12:12";
    }

    public String getId() {
        return id;
    }

    public void setId(String uuid) {
        id = uuid;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String pt) {
        path = pt;
    }

    public String getCwd() {
        return cwd;
    }

    public void setCwd(String cd) {
        cwd = cd;
    }

    public String getName() {
        return name;
    }

    public void setName(String ne) {
        name = ne;
    }

    public String getOrignName() {
        return orignName;
    }

    public void setOrignName(String on) {
        name = on;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String t) {
        time = t;
    }

    @Override
    public String toString() {
        return "Image{" + "id=" + id + ", path=" + path + ", cwd=" + cwd + ", name=" + name + ", orignName=" + orignName
                + ", time=" + time + "}";
    }

}
