document.addEventListener('DOMContentLoaded', () => {
    const profileSelect = document.getElementById('profileSelect');
    const createProfileButton = document.getElementById('createProfile');
    const fileUploadSection = document.getElementById('fileUploadSection');
    const dataFileInput = document.getElementById('dataFile');
    const uploadDataFileButton = document.getElementById('uploadDataFile');
    const previewTable = document.getElementById('previewTable');

    // Fetch profiles on load
    fetch('/profiles')
        .then(response => response.json())
        .then(profiles => {
            profiles.forEach(profile => {
                const option = document.createElement('option');
                option.value = profile;
                option.textContent = profile;
                profileSelect.appendChild(option);
            });
        });

    // Handle profile selection
    profileSelect.addEventListener('change', () => {
        if (profileSelect.value) {
            fileUploadSection.style.display = 'block';
        } else {
            fileUploadSection.style.display = 'none';
        }
    });

    // Redirect to create profile page
    createProfileButton.addEventListener('click', () => {
        window.location.href = '/create_profile.html';
    });

    // Handle file upload
    uploadDataFileButton.addEventListener('click', () => {
        const profileName = profileSelect.value;
        const dataFile = dataFileInput.files[0];
        if (profileName && dataFile) {
            const formData = new FormData();
            formData.append('dataFile', dataFile);
            fetch(`/profiles/${profileName}/upload`, {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(result => {
                    if (result.message) {
                        alert(result.message);
                        console.log('Preview:', result.preview);
                    } else {
                        alert('Error: ' + result.error);
                    }
                })
                .catch(error => {
                    alert('Error uploading file');
                    console.error('Error:', error);
                });
        } else {
            alert('Please select a profile and a file.');
        }
    });

    function renderPreview(preview) {
    const previewLines = preview.split('\n');
    const headers = previewLines[0].split(',');
    const rows = previewLines.slice(1);

    let tableHtml = '<table><thead><tr>';
    headers.forEach(header => {
        tableHtml += <th>${header}</th>;
    });
    tableHtml += '</tr></thead><tbody>';
    rows.forEach(row => {
        tableHtml += '<tr>';
        row.split(',').forEach(cell => {
            tableHtml += <td>${cell}</td>;
        });
        tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';

    previewTable.innerHTML = tableHtml;
}
});
