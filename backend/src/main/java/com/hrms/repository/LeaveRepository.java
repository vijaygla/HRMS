package com.hrms.repository;

import com.hrms.model.Leave;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LeaveRepository extends MongoRepository<Leave, String> {
    List<Leave> findByEmployeeId(String employeeId);

    List<Leave> findByStatus(String status);

    List<Leave> findByLeaveType(String leaveType);

    List<Leave> findByApprovedBy(String approvedBy);
}
