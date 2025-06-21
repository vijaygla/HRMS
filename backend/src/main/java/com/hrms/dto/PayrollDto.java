package com.hrms.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PayrollDto {
    private Long id;
    private Long employeeId;
    private BigDecimal salary;
    private LocalDate paymentDate;
    private String paymentMethod;

    public PayrollDto() {
    }

    public PayrollDto(Long id, Long employeeId, BigDecimal salary, LocalDate paymentDate, String paymentMethod) {
        this.id = id;
        this.employeeId = employeeId;
        this.salary = salary;
        this.paymentDate = paymentDate;
        this.paymentMethod = paymentMethod;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public BigDecimal getSalary() {
        return salary;
    }

    public void setSalary(BigDecimal salary) {
        this.salary = salary;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}