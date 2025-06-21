package com.hrms.controller;

import com.hrms.model.JobPosting;
import com.hrms.service.RecruitmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/recruitment")
@CrossOrigin(origins = "*")
public class RecruitmentController {

    @Autowired
    private RecruitmentService recruitmentService;

    @GetMapping("/jobs")
    public List<JobPosting> getAllJobPostings() {
        return recruitmentService.getAllJobPostings();
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<JobPosting> getJobPostingById(@PathVariable String id) {
        Optional<JobPosting> jobPosting = recruitmentService.getJobPostingById(id);
        return jobPosting.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/jobs")
    public JobPosting createJobPosting(@RequestBody JobPosting jobPosting) {
        return recruitmentService.createJobPosting(jobPosting);
    }

    @PutMapping("/jobs/{id}")
    public JobPosting updateJobPosting(@PathVariable String id, @RequestBody JobPosting jobPosting) {
        return recruitmentService.updateJobPosting(id, jobPosting);
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<Void> deleteJobPosting(@PathVariable String id) {
        recruitmentService.deleteJobPosting(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/jobs/status/{status}")
    public List<JobPosting> getJobPostingsByStatus(@PathVariable String status) {
        return recruitmentService.getJobPostingsByStatus(status);
    }

    @GetMapping("/jobs/department/{department}")
    public List<JobPosting> getJobPostingsByDepartment(@PathVariable String department) {
        return recruitmentService.getJobPostingsByDepartment(department);
    }
}
