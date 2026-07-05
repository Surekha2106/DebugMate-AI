package com.debugmate.model;

public class DetectedError {
    private Integer line;
    private String error;
    private String explanation;
    private String suggestion;

    public DetectedError() {
    }

    public DetectedError(Integer line, String error, String explanation, String suggestion) {
        this.line = line;
        this.error = error;
        this.explanation = explanation;
        this.suggestion = suggestion;
    }

    public Integer getLine() {
        return line;
    }

    public void setLine(Integer line) {
        this.line = line;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getSuggestion() {
        return suggestion;
    }

    public void setSuggestion(String suggestion) {
        this.suggestion = suggestion;
    }
}
