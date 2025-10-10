document.addEventListener('DOMContentLoaded', () => {
    const synthesizeBtn = document.getElementById('synthesize-btn');
    const directoryInput = document.getElementById('directory');
    const goalInput = document.getElementById('goal');

    const statusContainer = document.getElementById('status-container');
    const statusDetails = document.getElementById('status-details');
    const progressBar = document.getElementById('progress-bar');

    const resultsContainer = document.getElementById('results-container');
    const resultsPre = document.getElementById('results');

    let taskId = null;
    let pollingInterval = null;

    synthesizeBtn.addEventListener('click', async () => {
        const directory = directoryInput.value;
        const goal = goalInput.value;

        if (!directory || !goal) {
            alert('Please provide both a directory and a synthesis goal.');
            return;
        }

        // Reset UI
        synthesizeBtn.disabled = true;
        statusContainer.style.display = 'block';
        resultsContainer.style.display = 'none';
        resultsPre.textContent = '';
        updateStatus({ status: 'starting', progress: 0, details: 'Sending request to backend...' });

        try {
            const response = await fetch('/synthesize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ directory, goal }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            taskId = data.task_id;

            // Start polling for status
            pollingInterval = setInterval(pollStatus, 2000);

        } catch (error) {
            console.error('Error starting synthesis:', error);
            updateStatus({ status: 'error', progress: 0, details: `Failed to start synthesis: ${error.message}` });
            synthesizeBtn.disabled = false;
        }
    });

    const pollStatus = async () => {
        if (!taskId) return;

        try {
            const response = await fetch(`/status/${taskId}`);
            const data = await response.json();

            updateStatus(data);

            if (data.status === 'complete' || data.status === 'failed' || data.status === 'warning') {
                clearInterval(pollingInterval);
                pollingInterval = null;
                synthesizeBtn.disabled = false;

                if(data.status === 'complete') {
                    fetchResults();
                }
            }
        } catch (error) {
            console.error('Error polling status:', error);
            updateStatus({ status: 'error', progress: 0, details: `Error fetching status: ${error.message}` });
            clearInterval(pollingInterval);
            synthesizeBtn.disabled = false;
        }
    };

    const fetchResults = async () => {
        try {
            const response = await fetch(`/results/${taskId}`);
            const data = await response.json();

            resultsContainer.style.display = 'block';
            resultsPre.textContent = JSON.stringify(data, null, 2);

        } catch (error) {
            console.error('Error fetching results:', error);
            resultsPre.textContent = `Error fetching results: ${error.message}`;
        }
    };

    const updateStatus = (data) => {
        statusDetails.textContent = `[${data.status.toUpperCase()}] ${data.details}`;
        progressBar.style.width = `${data.progress}%`;

        // Change progress bar color based on status
        if (data.status === 'failed' || data.status === 'error') {
            progressBar.style.backgroundColor = '#d9534f';
        } else if (data.status === 'warning') {
            progressBar.style.backgroundColor = '#f0ad4e';
        } else {
            progressBar.style.backgroundColor = '#4caf50';
        }
    };
});