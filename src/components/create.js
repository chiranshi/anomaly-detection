document.addEventListener('DOMContentLoaded', () => {
    const saveProfileButton = document.getElementById('saveProfile');
    const profileNameInput = document.getElementById('profileName');
    const sampleFileInput = document.getElementById('sampleFile');
    const fieldsContainer = document.getElementById('fieldsContainer');
    const fieldsTable = document.getElementById('fieldsTable').getElementsByTagName('tbody')[0];
 
    sampleFileInput.addEventListener('change', () => {
        const sampleFile = sampleFileInput.files[0];
        if (sampleFile) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const text = event.target.result;
                const headers = text.split('\n')[0].split(',').map(header => header.trim());
                generateFieldsTable(headers);
                fieldsContainer.style.display = 'block';
            };
            reader.readAsText(sampleFile);
        } else {
            fieldsContainer.style.display = 'none';
        }
    });
 
    function generateFieldsTable(headers) {
        fieldsTable.innerHTML = ''; // Clear existing rows
        headers.forEach(header => {
            const row = fieldsTable.insertRow();
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);
            const cell4 = row.insertCell(3);
 
            cell1.textContent = header;
            cell2.innerHTML = '<input type="checkbox" checked>';
            cell3.innerHTML = `<input type="text" value="${header}">`;
            cell4.innerHTML = `
<select>
<option value="dimension">Dimension</option>
<option value="attribute">Attribute</option>
<option value="measure">Measure</option>
</select>
            `;
        });
    }

    saveProfileButton.addEventListener('click', () => {
        const profileName = profileNameInput.value;
        const sampleFile = sampleFileInput.files[0];
        if (profileName && sampleFile) {
            const fields = [];
            const rows = fieldsTable.rows;
            for (let i = 0; i < rows.length; i++) {
                const cells = rows[i].cells;
                fields.push({
                    field: cells[0].textContent,
                    required: cells[1].getElementsByTagName('input')[0].checked,
                    target: cells[2].getElementsByTagName('input')[0].value,
                    type: cells[3].getElementsByTagName('select')[0].value
                });
            }
            const formData = new FormData();
            formData.append('profileName', profileName);
            formData.append('sampleFile', sampleFile);
            formData.append('fields', JSON.stringify(fields));

            // Read the sample file to extract headers
            const reader = new FileReader();
            reader.onload = function(event) {
                const text = event.target.result;
                const headers = text.split('\n')[0].split(',').map(header => header.trim());
                const fields = headers.map(header => ({
                    field: header,
                    required: true, // You can change the logic here based on user input
                    target: header,
                    type: 'dimension' // You can change the logic here based on user input
                }));
                formData.append('fields', JSON.stringify(fields));

                fetch('/profiles', {
                    method: 'POST',
                    body: formData
                })
                    .then(response => response.text())
                    .then(result => {
                        alert(result);
                        window.location.href = '/index.html';
                    })
                    .catch(error => {
                        alert('Error creating profile');
                        console.error('Error:', error);
                    });
            };
            reader.readAsText(sampleFile);
        } else {
            alert('Please provide a profile name and upload a sample file.');
        }
    });
});