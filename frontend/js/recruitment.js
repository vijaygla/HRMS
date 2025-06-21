// recruitment.js
document.addEventListener('DOMContentLoaded', function() {
    const jobPostingsContainer = document.getElementById('job-postings');
    const applyButtons = document.querySelectorAll('.apply-button');

    // Fetch job postings from the backend
    fetch('/api/job-postings')
        .then(response => response.json())
        .then(data => {
            data.forEach(posting => {
                const postingElement = document.createElement('div');
                postingElement.classList.add('job-posting');
                postingElement.innerHTML = `
                    <h3>${posting.title}</h3>
                    <p>${posting.description}</p>
                    <button class="apply-button" data-id="${posting.id}">Apply</button>
                `;
                jobPostingsContainer.appendChild(postingElement);
            });
        })
        .catch(error => console.error('Error fetching job postings:', error));

    // Handle apply button clicks
    applyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const jobId = this.getAttribute('data-id');
            const applicationData = {
                jobId: jobId,
                userId: getCurrentUserId() // Assume this function retrieves the current user's ID
            };

            fetch('/api/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(applicationData)
            })
            .then(response => {
                if (response.ok) {
                    alert('Application submitted successfully!');
                } else {
                    alert('Failed to submit application.');
                }
            })
            .catch(error => console.error('Error submitting application:', error));
        });
    });
});