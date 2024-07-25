import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const FileUpload1 = ({ upload, selectedProfile }) => {
  const [profiles, setProfiles] = useState([]);
  const [dataFile, setDataFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [files, setFiles] = useState([]);
  const [timeFormat, setTimeFormat] = useState('');
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]); //
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await axios.get('http://localhost:4000/profiles');
        setProfiles(response.data);
      } catch (error) {
        console.error('Error fetching profiles', error);
      }
    };

    fetchProfiles();
    const interval = setInterval(fetchProfiles, 10000); // Fetch profiles every 10 seconds
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  useEffect(() => {
    const fetchColumnsForProfile = async () => {
      if (selectedProfile) {
        try {
          const response = await axios.post('http://localhost:5000/api/get-columns', {
            profile_name: selectedProfile
          });
          setColumns(response.data.columns);
        } catch (error) {
          console.error('Error fetching columns', error);
        }
      }
    };

    fetchColumnsForProfile();
  }, [selectedProfile]);

  const handleFileChange = async (event) => {
    const uploadedFiles = Array.from(event.target.files);
    const newFiles = uploadedFiles.map(file => ({
      name: file.name,
      file: file,
      directory: 'default/directory/path', // Initially set to default path
      isCompatible: null, // Initially set to null
      train: false,
      test: false,
    }));
    setFiles([...files, ...newFiles]);
    setDataFile(event.target.files[0]);
    console.log('Selected file:', event.target.files[0]);
  };

  const handleUpload = async () => {
    if (selectedProfile && dataFile) {
      const formData = new FormData();
      formData.append('dataFile', dataFile);
      console.log('Uploading file:', dataFile);

      try {
        const response = await axios.post(`http://localhost:4000/profiles/${selectedProfile}/upload`, formData);
        const result = response.data;

        if (result.message) {
          alert(result.message);
          setPreview(result.preview); // Assuming result.preview is a CSV string

          const updatedFiles = files.map(file => {
            if (file.name === dataFile.name) {
              const isCompatible = !result.message.toLowerCase().includes('not compatible');
              return {
                ...file,
                isCompatible,
                directory: result.dataFilePath // Update directory with actual path
              };
            }
            return file;
          });

          setFiles(updatedFiles);
        } else {
          alert('Error: ' + result.error);
        }
      } catch (error) {
        alert('File already exists');
        console.error('Error:', error);
      }
    } else {
      alert('Please select a profile and a file.');
    }
  };

  const handleCheckboxChange = (index, type) => {
    const newFiles = files.map((file, i) => {
      if (i === index) {
        return { ...file, [type]: !file[type] };
      }
      return file;
    });
    setFiles(newFiles);
  };

  const handleDelete = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  const handleColumnSelectionChange = (event) => {
    const value = event.target.value;
    let newSelectedColumns;
    if (selectedColumns.includes(value)) {
        // If the value is already selected, remove it from the selectedColumns
        newSelectedColumns = selectedColumns.filter(item => item !== value);
    } else {
        // If the value is not yet selected, add it to the selectedColumns
        newSelectedColumns = [...selectedColumns, value];
    }
    setSelectedColumns(newSelectedColumns);
    console.log(newSelectedColumns);
};

const handleSubmit = async () => {
  console.log('Time Format:', timeFormat);
  console.log('Selected Columns:', selectedColumns);
  if (files.length > 0 ) {
    console.log('Files:', files);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file.file); // Append the actual file object
      });
      formData.append('time_format', timeFormat);
      selectedColumns.forEach(column => {
        formData.append('time_columns', column); // Append each selected column individually
      });
      formData.append('selected_profile', selectedProfile);

      const response = await axios.post('http://127.0.0.1:5000/convert-and-combine', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log(response.data);
      alert(response.data.message);
    } catch (error) {
      alert('Error combining CSV files');
      console.error('Error:', error);
    }
  } else {
    alert('Please upload files, provide the time format, and select time columns.');
  }
};


  return (
    <div>
      {selectedProfile && (
        <div id="fileUploadSection">
          <input type="file" id="dataFile" onChange={handleFileChange} />
          <button id="uploadDataFile" onClick={handleUpload}>Upload Data File</button>
        </div>
      )}
      <div id="previewTable">
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>File Name</th>
              <th>Directory</th>
              <th>Train/Test</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, index) => (
              <tr key={index}>
                <td>
                  <div
                    style={{ color: file.isCompatible === null ? 'grey' : file.isCompatible ? 'green' : 'red' }}
                  >
                    {file.isCompatible === null ? 'Pending' : file.isCompatible ? 'Compatible' : 'Not Compatible'}
                  </div>
                </td>
                <td>{file.name}</td>
                <td>{file.directory}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={file.train}
                    onChange={() => handleCheckboxChange(index, 'train')}
                  />
                  <input
                    type="checkbox"
                    checked={file.test}
                    onChange={() => handleCheckboxChange(index, 'test')}
                  />
                </td>
                <td>
                  <button onClick={() => handleDelete(index)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <label htmlFor="timeFormat">Time Format:</label>
        <input
          type="text"
          id="timeFormat"
          value={timeFormat}
          onChange={(e) => setTimeFormat(e.target.value)}
          placeholder="Enter time format (e.g., %Y%m%d)"
        />
      </div>
      <div>
        <label htmlFor="columnSelection">Select Time Columns:</label>
        <select
          id="columnSelection"
          multiple
          value={selectedColumns}
          onChange={handleColumnSelectionChange}
          size="5"
        >
          {columns.map((column, index) => (
            <option key={index} value={column}>{column}</option>
          ))}
        </select>
      </div>
      <div>
        <strong>Selected Columns:</strong>
        <ul>
          {selectedColumns.map((column, index) => (
            <li key={index}>{column}</li>
          ))}
        </ul>
      </div>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default FileUpload1;
