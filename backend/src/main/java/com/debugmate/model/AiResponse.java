package com.debugmate.model;

import java.util.List;

public class AiResponse {
    private String summary;
    private List<DetectedError> detectedErrors;
    private String optimizedCode;
    private List<String> bestPractices;
    private ComplexityAnalysis complexityAnalysis;

    public AiResponse() {
    }

    public AiResponse(String summary, List<DetectedError> detectedErrors, String optimizedCode, List<String> bestPractices, ComplexityAnalysis complexityAnalysis) {
        this.summary = summary;
        this.detectedErrors = detectedErrors;
        this.optimizedCode = optimizedCode;
        this.bestPractices = bestPractices;
        this.complexityAnalysis = complexityAnalysis;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<DetectedError> getDetectedErrors() {
        return detectedErrors;
    }

    public void setDetectedErrors(List<DetectedError> detectedErrors) {
        this.detectedErrors = detectedErrors;
    }

    public String getOptimizedCode() {
        return optimizedCode;
    }

    public void setOptimizedCode(String optimizedCode) {
        this.optimizedCode = optimizedCode;
    }

    public List<String> getBestPractices() {
        return bestPractices;
    }

    public void setBestPractices(List<String> bestPractices) {
        this.bestPractices = bestPractices;
    }

    public ComplexityAnalysis getComplexityAnalysis() {
        return complexityAnalysis;
    }

    public void setComplexityAnalysis(ComplexityAnalysis complexityAnalysis) {
        this.complexityAnalysis = complexityAnalysis;
    }
}
