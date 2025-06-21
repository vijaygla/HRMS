package com.hrms.service;

import com.hrms.model.JobPosting;
import com.hrms.repository.JobPostingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class RecruitmentService {

    @Autowired
    private JobPostingRepository jobPostingRepository;

    public List<JobPosting> getAllJobPostings() {
        return jobPostingRepository.findAll();
    }

    public Optional<JobPosting> getJobPostingById(String id) {
        return jobPostingRepository.findById(id);
    }

    public JobPosting createJobPosting(JobPosting jobPosting) {
        jobPosting.setCreatedAt(LocalDateTime.now());
        jobPosting.setUpdatedAt(LocalDateTime.now());
        return jobPostingRepository.save(jobPosting);
    }

    public JobPosting updateJobPosting(String id, JobPosting jobPosting) {
        jobPosting.setId(id);
        jobPosting.setUpdatedAt(LocalDateTime.now());
        return jobPostingRepository.save(jobPosting);
    }

    public void deleteJobPosting(String id) {
        jobPostingRepository.deleteById(id);
    }

    public List<JobPosting> getJobPostingsByStatus(String status) {
        return jobPostingRepository.findByStatus(status);
    }

    public List<JobPosting> getJobPostingsByDepartment(String department) {
        return jobPostingRepository.findByDepartment(department);
    }
}

