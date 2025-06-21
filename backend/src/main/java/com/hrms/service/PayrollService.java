package com.hrms.service;

import com.hrms.model.Payroll;
import com.hrms.repository.PayrollRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PayrollService {

    @Autowired
    private PayrollRepository payrollRepository;

    public List<Payroll> getAllPayrolls() {
        return payrollRepository.findAll();
    }

    public Optional<Payroll> getPayrollById(String id) {
        return payrollRepository.findById(id);
    }

    public List<Payroll> getPayrollsByEmployeeId(String employeeId) {
        return payrollRepository.findByEmployeeId(employeeId);
    }

    public Payroll createPayroll(Payroll payroll) {
        payroll.calculateGrossPay();
        payroll.calculateTotalDeductions();
        payroll.calculateNetPay();
        payroll.setCreatedAt(LocalDateTime.now());
        payroll.setUpdatedAt(LocalDateTime.now());
        return payrollRepository.save(payroll);
    }

    public Payroll updatePayroll(String id, Payroll payroll) {
        payroll.setId(id);
        payroll.calculateGrossPay();
        payroll.calculateTotalDeductions();
        payroll.calculateNetPay();
        payroll.setUpdatedAt(LocalDateTime.now());
        return payrollRepository.save(payroll);
    }

    public void deletePayroll(String id) {
        payrollRepository.deleteById(id);
    }

    public List<Payroll> getPayrollsByStatus(String status) {
        return payrollRepository.findByStatus(status);
    }
}
