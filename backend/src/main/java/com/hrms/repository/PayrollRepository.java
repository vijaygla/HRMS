package com.hrms.repository;

import com.hrms.model.Payroll;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PayrollRepository extends MongoRepository<Payroll, String> {
    List<Payroll> findByEmployeeId(String employeeId);

    List<Payroll> findByStatus(String status);

    List<Payroll> findByPayPeriodStartAndPayPeriodEnd(LocalDate startDate, LocalDate endDate);

    List<Payroll> findByPayDateBetween(LocalDate startDate, LocalDate endDate);
}
