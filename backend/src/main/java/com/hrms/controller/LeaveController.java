package com.hrms.controller;

import com.hrms.model.Leave;
import com.hrms.service.LeaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/leaves")
@CrossOrigin(origins = "*")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    @GetMapping
    public List<Leave> getAllLeaves() {
        return leaveService.getAllLeaves();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Leave> getLeaveById(@PathVariable String id) {
        Optional<Leave> leave = leaveService.getLeaveById(id);
        return leave.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/employee/{employeeId}")
    public List<Leave> getLeavesByEmployeeId(@PathVariable String employeeId) {
        return leaveService.getLeavesByEmployeeId(employeeId);
    }

    @PostMapping
    public Leave createLeave(@RequestBody Leave leave) {
        return leaveService.createLeave(leave);
    }

    @PutMapping("/{id}")
    public Leave updateLeave(@PathVariable String id, @RequestBody Leave leave) {
        return leaveService.updateLeave(id, leave);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLeave(@PathVariable String id) {
        leaveService.deleteLeave(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Leave> approveLeave(@PathVariable String id, @RequestBody Map<String, String> request) {
        String approvedBy = request.get("approvedBy");
        Leave leave = leaveService.approveLeave(id, approvedBy);
        return leave != null ? ResponseEntity.ok(leave) : ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Leave> rejectLeave(@PathVariable String id, @RequestBody Map<String, String> request) {
        String rejectedBy = request.get("rejectedBy");
        String comments = request.get("comments");
        Leave leave = leaveService.rejectLeave(id, rejectedBy, comments);
        return leave != null ? ResponseEntity.ok(leave) : ResponseEntity.notFound().build();
    }

    @GetMapping("/status/{status}")
    public List<Leave> getLeavesByStatus(@PathVariable String status) {
        return leaveService.getLeavesByStatus(status);
    }
}
