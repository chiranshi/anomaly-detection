import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const ProfileUploader = ({upload,setupload,profileName,setProfileName}) => {
  // const [profileName, setProfileName] = useState('');
  const [sampleFile, setSampleFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [fields, setFields] = useState([]);
  const [isFieldsVisible, setIsFieldsVisible] = useState(false);

  useEffect(() => {
    if (sampleFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const headers = text.split('\n')[0].split(',').map(header => header.trim());
        generateFieldsTable(headers);
        setIsFieldsVisible(true);
      };
      reader.readAsText(sampleFile);
    } else {
      setIsFieldsVisible(false);
    }
  }, [sampleFile]);

  const generateFieldsTable = (headers) => {
    const initialFields = headers.map(header => ({
      field: header,
      required: true,
      target: header,
      type: 'dimension'
    }));
    setFields(initialFields);
  };

  const handleFileChange = (event) => {
    setSampleFile(event.target.files[0]);
  };

  const handleInputChange = (index, event) => {
    const { name, value, checked, type } = event.target;
    const updatedFields = [...fields];
    updatedFields[index][name] = type === 'checkbox' ? checked : value;
    setFields(updatedFields);
  };

  const handleSubmit = () => {
    if (profileName && sampleFile) {
      const formData = new FormData();
      formData.append('profileName', profileName);
      formData.append('sampleFile', sampleFile);
      formData.append('fields', JSON.stringify(fields));
      setupload(true)
      fetch('http://localhost:4000/profiles', {
        method: 'POST',
        body: formData
      })
        .then(response => response.text())
        .then(result => {
        alert("successful")
        
        })
        .catch(error => {
          alert('Error creating profile');
          console.error('Error:', error);
        });
    } else {
      alert('Please provide a profile name and upload a sample file.');
    }
  };

  return (
    <div>
      <div>
        <input
          type="text"
          id="profileName"
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          placeholder="Enter Profile Name"
        />
      </div>
      <div>
      
      <input type="file" id="sampleFile" onChange={handleFileChange} />
      
      </div>
      {isFieldsVisible && (
        <div id="fieldsContainer">
          <table id="fieldsTable">
            <thead>
              <tr>
                <th>Field</th>
                <th>Required</th>
                <th>Target</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={index}>
                  <td>{field.field}</td>
                  <td>
                    <input
                      type="checkbox"
                      name="required"
                      checked={field.required}
                      onChange={(e) => handleInputChange(index, e)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="target"
                      value={field.target}
                      onChange={(e) => handleInputChange(index, e)}
                    />
                  </td>
                  <td>
                    <select
                      name="type"
                      value={field.type}
                      onChange={(e) => handleInputChange(index, e)}
                    >
                      <option value="time dimension">Time Dimension</option>
                      <option value="dimension">Dimension</option>
                      <option value="attribute">Attribute</option>
                      <option value="measure">Measure</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button id="saveProfile" onClick={handleSubmit}>Save Profile</button>
    </div>
  );
};

export default ProfileUploader;