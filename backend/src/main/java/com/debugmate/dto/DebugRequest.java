package com.debugmate.dto;

import jakarta.validation.constraints.NotBlank;

public class DebugRequest {
    @NotBlank(message = "Code input cannot be empty")
    private String code;

    @NotBlank(message = "Programming language is required")
    private String language;

    public DebugRequest() {
    }

    public DebugRequest(String code, String language) {
        this.code = code;
        this.language = language;
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
}
