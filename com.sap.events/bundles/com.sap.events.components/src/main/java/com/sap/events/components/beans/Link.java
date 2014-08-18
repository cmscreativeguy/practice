package com.sap.events.components.beans;

public class Link {
    private String name;
    private String url;

    public Link() {};

    public String getUrl() {
        return url;
    }

    public Link(String name, String url) {
        super();
        this.name = name;
        this.url = url;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setUrl(String url) {
        this.url = url;
    }

}
