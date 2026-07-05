package com.debugmate.model;

public class ComplexityAnalysis {
    private String time;
    private String space;

    public ComplexityAnalysis() {
    }

    public ComplexityAnalysis(String time, String space) {
        this.time = time;
        this.space = space;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getSpace() {
        return space;
    }

    public void setSpace(String space) {
        this.space = space;
    }
}
