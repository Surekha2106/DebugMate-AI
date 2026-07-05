package com.debugmate.dto;

import java.time.Instant;

public class ProfileResponse {
    private String id;
    private String name;
    private String email;
    private Instant createdDate;

    public ProfileResponse() {
    }

    public ProfileResponse(String id, String name, String email, Instant createdDate) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.createdDate = createdDate;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }
}
