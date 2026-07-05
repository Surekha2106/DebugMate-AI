package com.debugmate.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "saved_snippets")
public class SavedSnippet {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String userId;
    
    @Column(columnDefinition = "TEXT")
    private String code;
    
    private String language;
    private String title;
    private Instant createdDate;

    public SavedSnippet() {
    }

    public SavedSnippet(String id, String userId, String code, String language, String title, Instant createdDate) {
        this.id = id;
        this.userId = userId;
        this.code = code;
        this.language = language;
        this.title = title;
        this.createdDate = createdDate;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }
}
