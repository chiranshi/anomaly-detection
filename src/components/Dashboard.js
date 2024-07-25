import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import './Dashboard.css';
import './fileupload.css';
import ProfileUploader from './fileuploader';
import FileUpload1 from './upload';
import '@fortawesome/fontawesome-free/css/all.min.css';



function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState({ import: false, upload: false, operations: false, files: false });

  const [fileList, setFileList] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedHeaders, setSelectedHeaders] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [profileName, setProfileName] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [profileCreated, setProfileCreated] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);
  const [filePreview, setFilePreview] = useState("");
  const [anomalyResults, setAnomalyResults] = useState(null);
  const [anomalyOptions, setAnomalyOptions] = useState({ outlier: true, measure_dependency: true, metadata_complete: true });
  const [anomalyFile, setAnomalyFile] = useState(null); // Added state for anomaly file

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
    const interval = setInterval(fetchProfiles, 5000); // Fetch profiles every 5 seconds
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file && profileName) {
      Papa.parse(file, {
        header: true,
        complete: function (results) {
          setHeaders(results.meta.fields);
          displayTable(results.meta.fields);
          cacheFile(file.name, results.meta.fields);
          const formData = new FormData();
          formData.append('profileName', profileName);
          formData.append('sampleFile', file);

          // Read the sample file to extract headers
          const reader = new FileReader();
          reader.onload = function (event) {
            const text = event.target.result;
            const headers = text.split('\n')[0].split(',').map(header => header.trim());
            const fields = headers.map(header => ({
              field: header,
              required: true, // You can change the logic here based on user input
              target: header,
              type: 'dimension' // You can change the logic here based on user input
            }));
            formData.append('fields', JSON.stringify(fields));
            console.log(formData);
            fetch('http://localhost:4000/profiles', {
              method: 'POST',
              body: formData
            })
              .then(response => response.text())
              .then(result => {
                alert(result);
                setProfileCreated(true);
                setUploadSuccess(true);
              })
              .catch(error => {
                alert('Error creating profile');
                console.error('Error:', error);
              });
          };
          reader.readAsText(file);
        },
      });
    } else {
      alert('Please provide a profile name and upload a sample file.');
    }
  };

  const displayTable = (headers) => {
    const initialTableData = headers.map((header) => ({
      field: header,
      required: false,
      target: header,
      type: 'dimension',
    }));
    setTableData(initialTableData);
  };

  const handleInputChange = (index, event) => {
    const { name, value, checked, type } = event.target;
    const updatedTableData = [...tableData];
    updatedTableData[index][name] = type === 'checkbox' ? checked : value;
    setTableData(updatedTableData);
  };

  const saveConfiguration = async () => {
    const json = JSON.stringify(tableData, null, 2);
    localStorage.setItem('configData', json);
    const handle = await window.showSaveFilePicker({
      suggestedName: 'config.json',
      types: [
        {
          description: 'JSON Files',
          accept: { 'application/json': ['.json'] },
        },
      ],
    });
    const writableStream = await handle.createWritable();
    await writableStream.write(json);
    await writableStream.close();
    setConfigSaved(true);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDropdown = (dropdownName) => {
    setDropdownOpen({ ...dropdownOpen, [dropdownName]: !dropdownOpen[dropdownName] });
  };

  const fetchFiles = async () => {
    const cachedFiles = JSON.parse(localStorage.getItem('cachedFiles')) || [];
    setFileList(cachedFiles);
  };

  const cacheFile = (fileName, headers) => {
    const cachedFiles = JSON.parse(localStorage.getItem('cachedFiles')) || [];
    const newFile = { name: fileName, headers };
    localStorage.setItem('cachedFiles', JSON.stringify([...cachedFiles, newFile]));
    setFileList([...cachedFiles, newFile]);
  };

  const fetchHeaders = async (fileName) => {
    const cachedFiles = JSON.parse(localStorage.getItem('cachedFiles')) || [];
    const file = cachedFiles.find((f) => f.name === fileName);
    if (file) {
      setHeaders(file.headers);
      displayTable(file.headers);
    }
  };


  const handleHeaderSelection = (header) => {
    setSelectedHeaders((prevState) =>
      prevState.includes(header)
        ? prevState.filter((h) => h !== header)
        : [...prevState, header]
    );
  };

  const saveHeaders = async () => {
    try {
      const response = await axios.post('/api/picklist', { headers: selectedHeaders });
      alert(response.data.message);
    } catch (error) {
      console.error('Error saving headers', error);
    }
  };

  const handleProfileNameChange = (e) => {
    setProfileName(e.target.value);
    setUploadSuccess(true);
  };

  const handleFileUploadForProfile = (event) => {
    const file = event.target.files[0];

    if (file && configSaved) {
      const formData = new FormData();
      formData.append('dataFile', file);

      fetch(`http://localhost:4000/profiles/${profileName}/upload`, {
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())
        .then(result => {
          if (result.message === 'Uploaded file is compatible with the given format') {
            setFilePreview(result.preview);
          } else {
            alert(result.message);
          }
        })
        .catch(error => {
          alert('Error uploading file');
          console.error('Error:', error);
        });
    } else {
      alert('Please upload a valid file.');
    }
  };

  const saveProfile = async () => {
    const profileConfig = tableData.map(row => ({
      field: row.field,
      required: row.required,
      target: row.target,
      type: row.type
    }));

    try {
      const response = await axios.post('/api/save-profile', { profileName, profileConfig });
      if (response.data.message === 'Profile configuration saved successfully') {
        window.location.href = 'index.html';
      }
    } catch (error) {
      console.error('Error saving profile configuration:', error);
    }
  };

  const deleteFile = (fileName) => {
    const cachedFiles = JSON.parse(localStorage.getItem('cachedFiles')) || [];
    const updatedFiles = cachedFiles.filter((file) => file.name !== fileName);
    localStorage.setItem('cachedFiles', JSON.stringify(updatedFiles));
    setFileList(updatedFiles);
  };
  const handleAnomalyFileChange = (event) => {
    setAnomalyFile(event.target.files[0]); // Update state with the selected file
  };

  const handleAnomalyFileUpload = async (e) => {
    e.preventDefault();
    if (!anomalyFile) {
      alert('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', anomalyFile);
    formData.append('options', JSON.stringify(anomalyOptions));

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData);
      setAnomalyResults(response.data);
    } catch (error) {
      console.error('Error uploading file', error);
    }
  };

  const handleAnomalyOptionsChange = (e) => {
    const { name, checked } = e.target;
    setAnomalyOptions(prevOptions => ({
      ...prevOptions,
      [name]: checked,
    }));
  };

  return (
    <div className="Dashboard">
      <div className="header">
        <div className="menu-icon" onClick={toggleSidebar}>
          &#9776;
        </div>
        <div className="title">Anomaly Detection</div>
        <div className='fa-fa' onClick={() => (window.location.href = '/')}><i class="fa-solid fa-circle-user"></i></div>
      </div>
      
      
      <div className={`sidebar ${sidebarOpen ? '' : 'closed'}`}>

      <div className="dropdown" onClick={() => (window.location.href = '/Dashboard')}>Create Profile
        <span className='fa-fa'><i class="fa-solid fa-id-card-clip"></i></span>
            </div>
        
        <div className="dropdown" onClick={() => toggleDropdown('import')}>
        
            <select id="profileSelect" onChange={handleProfileNameChange}>
              <option value={profileName}>{profileName=="" ? "Select Profile":profileName}</option>
              {profiles.map((profile, index) => (
                <option key={index} value={profile.name}>{profile.name}</option>
              ))}
            </select><span className='fa-fa'>
            {/* <i className="fas fa-chart-line"></i> */}
            </span>
        </div>
        
        <div className="dropdown" onClick={() => toggleDropdown('import')}>View Files
        <span className='fa-fa'> <i className="fas fa-folder-open"></i></span>
        <ul className={`dropdown-list ${dropdownOpen.file ? 'open' : 'closed'}`}>
          <li onClick={fetchFiles}>Previous files</li>
          <ul className={`dropdown-list ${dropdownOpen.files ? 'open' : 'closed'}`}>
           {fileList.length > 0 &&
             fileList.map((file, index) => (
            <li key={index}>
            <span onClick={() => fetchHeaders(file.name)}>
                   {file.name}
            </span> 
            <span className="delete-icon" onClick={() => deleteFile(file.name)}>🗑️</span>
            </li>
            ))}
            </ul>
            </ul>
            </div>
       
        <div className="dropdown" onClick={() => toggleDropdown('anomaly')}>Operations
        <span className='fa-fa'><i className="fas fa-cogs"></i></span>
          <ul className={`dropdown-list ${dropdownOpen.anomaly ? 'open' : 'closed'}`}>
            <form onSubmit={handleAnomalyFileUpload}>
              <li>
                <input type="file" onChange={handleAnomalyFileChange} />
              </li>
              <li>
                <label>
                  <input
                    type="checkbox"
                    name="outlier"
                    checked={anomalyOptions.outlier}
                    onChange={handleAnomalyOptionsChange}
                  />
                  Detect Outliers
                </label>
              </li>
              <li>
                <label>
                  <input
                    type="checkbox"
                    name="measure_dependency"
                    checked={anomalyOptions.measure_dependency}
                    onChange={handleAnomalyOptionsChange}
                  />
                  Measure Dependency
                </label>
              </li>
              <li>
                <label>
                  <input
                    type="checkbox"
                    name="metadata_complete"
                    checked={anomalyOptions.metadata_complete}
                    onChange={handleAnomalyOptionsChange}
                  />
                  Metadata Completeness
                </label>
              </li>
              <li>
                <button type="submit">Upload</button>
              </li>
            </form>
          </ul>
        </div>
      </div>

      <div className={`content ${sidebarOpen ? '' : 'shift'}`}>

        <div className="file-upload-container">
          {uploadSuccess === false && <ProfileUploader upload={uploadSuccess} setupload={setUploadSuccess} profileName={profileName} setProfileName={setProfileName}/>}
          {uploadSuccess === true && <FileUpload1 upload={uploadSuccess } selectedProfile={profileName} />} 
          </div>
        
      </div>
    </div>
  );
}

export default Dashboard;
