package com.debugmate.dto;

import jakarta.validation.constraints.NotBlank;

public class SnippetRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Code content is required")
    private String code;

    @NotBlank(message = "Language is required")
    private String language;

    public SnippetRequest() {
    }

    public SnippetRequest(String title, String code, String language) {
        this.title = title;
        this.code = code;
        this.language = language;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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
