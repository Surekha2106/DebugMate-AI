package com.debugmate.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;

@Entity
@Table(name = "debug_sessions")
public class DebugSession {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String userId;
    private String language;
    
    @Column(columnDefinition = "TEXT")
    private String inputCode;
    
    @JdbcTypeCode(SqlTypes.JSON)
    private AiResponse aiResponse;
    
    private Instant createdDate;

    public DebugSession() {
    }

    public DebugSession(String id, String userId, String language, String inputCode, AiResponse aiResponse, Instant createdDate) {
        this.id = id;
        this.userId = userId;
        this.language = language;
        this.inputCode = inputCode;
        this.aiResponse = aiResponse;
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

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getInputCode() {
        return inputCode;
    }

    public void setInputCode(String inputCode) {
        this.inputCode = inputCode;
    }

    public AiResponse getAiResponse() {
        return aiResponse;
    }

    public void setAiResponse(AiResponse aiResponse) {
        this.aiResponse = aiResponse;
    }

    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }
}
