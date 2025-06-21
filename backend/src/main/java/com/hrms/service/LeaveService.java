package com.hrms.service;

import com.hrms.model.Leave;
import com.hrms.repository.LeaveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LeaveService {

    @Autowired
    private LeaveRepository leaveRepository;

    public List<Leave> getAllLeaves() {
        return leaveRepository.findAll();
    }

    public Optional<Leave> getLeaveById(String id) {
        return leaveRepository.findById(id);
    }

    public List<Leave> getLeavesByEmployeeId(String employeeId) {
        return leaveRepository.findByEmployeeId(employeeId);
    }

    public Leave createLeave(Leave leave) {
        leave.setCreatedAt(LocalDateTime.now());
        leave.setUpdatedAt(LocalDateTime.now());
        return leaveRepository.save(leave);
    }

    public Leave updateLeave(String id, Leave leave) {
        leave.setId(id);
        leave.setUpdatedAt(LocalDateTime.now());
        return leaveRepository.save(leave);
    }

    public void deleteLeave(String id) {
        leaveRepository.deleteById(id);
    }

    public List<Leave> getLeavesByStatus(String status) {
        return leaveRepository.findByStatus(status);
    }

    public Leave approveLeave(String id, String approvedBy) {
        Optional<Leave> leaveOpt = leaveRepository.findById(id);
        if (leaveOpt.isPresent()) {
            Leave leave = leaveOpt.get();
            leave.setStatus("APPROVED");
            leave.setApprovedBy(approvedBy);
            leave.setUpdatedAt(LocalDateTime.now());
            return leaveRepository.save(leave);
        }
        return null;
    }

    public Leave rejectLeave(String id, String rejectedBy, String comments) {
        Optional<Leave> leaveOpt = leaveRepository.findById(id);
        if (leaveOpt.isPresent()) {
            Leave leave = leaveOpt.get();
            leave.setStatus("REJECTED");
            leave.setApprovedBy(rejectedBy);
            leave.setComments(comments);
            leave.setUpdatedAt(LocalDateTime.now());
            return leaveRepository.save(leave);
        }
        return null;
    }
}
