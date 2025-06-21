package com.hrms.model;

public class Performance {
    private String id;
    private String employeeId;
    private String reviewPeriod;
    private String performanceRating;
    private String comments;

    // Constructors
    public Performance() {
    }

    public Performance(String id, String employeeId, String reviewPeriod, String performanceRating, String comments) {
        this.id = id;
        this.employeeId = employeeId;
        this.reviewPeriod = reviewPeriod;
        this.performanceRating = performanceRating;
        this.comments = comments;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getReviewPeriod() {
        return reviewPeriod;
    }

    public void setReviewPeriod(String reviewPeriod) {
        this.reviewPeriod = reviewPeriod;
    }

    public String getPerformanceRating() {
        return performanceRating;
    }

    public void setPerformanceRating(String performanceRating) {
        this.performanceRating = performanceRating;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }
}