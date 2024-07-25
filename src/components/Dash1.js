// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Papa from 'papaparse';
// import './Dashboard.css';
// import './fileupload.css';


// function Dashboard() {

// const [sidebarOpen, setSidebarOpen] = useState(true);
// const [dropdownOpen, setDropdownOpen] = useState({ import: false, upload: false, operations: false, files: false });

// const [fileList, setFileList] = useState([]);
// const [headers, setHeaders] = useState([]);
// const [selectedHeaders, setSelectedHeaders] = useState([]);
// const [uploadSuccess, setUploadSuccess] = useState(false);
// const [tableData, setTableData] = useState([]);
// const [profileName, setProfileName] = useState("");
// const [profiles, setProfiles] = useState([]);
// const [profileCreated, setProfileCreated] = useState(false);
// const [configSaved, setConfigSaved] = useState(false);
// const [filePreview, setFilePreview] = useState("");


//   useEffect(() => {

//     fetchFiles();
//     fetchProfiles();
//   }, []);


//   const fetchProfiles = async () => {

//     try {
//       const response = await axios.get('http://localhost:4000/profiles');
//       setProfiles(response.data);
//     } catch (error) {
//       console.error('Error fetching profiles', error);
//     }
//   };


//   const handleFileUpload = (event) => {
//     const file = event.target.files[0];
  
//     if (file && profileName) {
//       Papa.parse(file, {
//         header: true,
//         complete: function (results) {
//           setHeaders(results.meta.fields);
//           displayTable(results.meta.fields);
//           cacheFile(file.name, results.meta.fields);
//           const formData = new FormData();
//           formData.append('profileName', profileName);
//           formData.append('sampleFile', file);
  
//           // Read the sample file to extract headers
//           const reader = new FileReader();
//           reader.onload = function (event) {
//             const text = event.target.result;
//             const headers = text.split('\n')[0].split(',').map(header => header.trim());
//             const fields = headers.map(header => ({
//               field: header,
//               required: true, // You can change the logic here based on user input
//               target: header,
//               type: 'dimension' // You can change the logic here based on user input
//             }));
//             formData.append('fields', JSON.stringify(fields));
//             console.log(formData);
//             fetch('http://localhost:4000/profiles', {
//               method: 'POST',
//               body: formData
//             })
//               .then(response => response.text())
//               .then(result => {
//                 alert(result);
//                 setProfileCreated(true);
//                 setUploadSuccess(true);
//               })
//               .catch(error => {
//                 alert('Error creating profile');
//                 console.error('Error:', error);
//               });
//           };
//           reader.readAsText(file);
//         },
//       });
//     } else {
//       alert('Please provide a profile name and upload a sample file.');
//     }
//   };
  

//   const displayTable = (headers) => {
//     const initialTableData = headers.map((header) => ({
//       field: header,
//       required: false,
//       target: header,
//       type: 'dimension',
//    }));
//     setTableData(initialTableData);
//   };


//   const handleInputChange = (index, event) => {
//     const { name, value, checked, type } = event.target;
//     const updatedTableData = [...tableData];
//     updatedTableData[index][name] = type === 'checkbox' ? checked : value;
//     setTableData(updatedTableData);
//   };


//   const saveConfiguration = async () => {
//     const json = JSON.stringify(tableData, null, 2);
//     localStorage.setItem('configData', json);
//     const handle = await window.showSaveFilePicker({
//       suggestedName: 'config.json',
//       types: [
//         {
//           description: 'JSON Files',
//           accept: { 'application/json': ['.json'] },
//         },
//       ],
//     });
//     const writableStream = await handle.createWritable();
//     await writableStream.write(json);
//     await writableStream.close();
//     setConfigSaved(true);
//   };
  
//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   const toggleDropdown = (dropdownName) => {
//     setDropdownOpen({ ...dropdownOpen, [dropdownName]: !dropdownOpen[dropdownName] });
//   };

//   const fetchFiles = async () => {
//     const cachedFiles = JSON.parse(localStorage.getItem('cachedFiles')) || [];
//     setFileList(cachedFiles);
//   };


//   const cacheFile = (fileName, headers) => {
//     const cachedFiles = JSON.parse(localStorage.getItem('cachedFiles')) || [];
//     const newFile = { name: fileName, headers };
//     localStorage.setItem('cachedFiles', JSON.stringify([...cachedFiles, newFile]));
//     setFileList([...cachedFiles, newFile]);
//   };


//   const fetchHeaders = async (fileName) => {
//     const cachedFiles = JSON.parse(localStorage.getItem('cachedFiles')) || [];
//     const file = cachedFiles.find((f) => f.name === fileName);
//     if (file) {
//       setHeaders(file.headers);
//       displayTable(file.headers);
//     }
//   };

 

//   const mergeFiles = async () => {
//     try {
//       const response = await axios.post('/api/merge');
//       alert(response.data.message);
//     } catch (error) {
//       console.error('Error merging files', error);
//     }
//   };


//   const handleHeaderSelection = (header) => {
//     setSelectedHeaders((prevState) =>
//       prevState.includes(header)
//         ? prevState.filter((h) => h !== header)
//         : [...prevState, header]
//     );
//   };


//   const saveHeaders = async () => {
//     try {
//       const response = await axios.post('/api/picklist', { headers: selectedHeaders });
//       alert(response.data.message);
//     } catch (error) {
//       console.error('Error saving headers', error);
//     }
//   };


//   const handleProfileNameChange = (e) => {
//     setProfileName(e.target.value);
//   };
//   const handleFileUploadForProfile = (event) => {
//     const file = event.target.files[0];
  
//     if (file && configSaved) {
//       const formData = new FormData();
//       formData.append('dataFile', file);
  
//       fetch(`http://localhost:4000/profiles/${profileName}/upload`, {
//         method: 'POST',
//         body: formData,
//       })
//         .then(response => response.json())
//         .then(result => {
//           if (result.message === 'Uploaded file is compatible with the given format') {
//             setFilePreview(result.preview);
//           } else {
//             alert(result.message);
//           }
//         })
//         .catch(error => {
//           alert('Error uploading file');
//           console.error('Error:', error);
//         });
//     } else {
//       alert('Please upload a valid file.');
//     }
//   };


//   const saveProfile = async () => {
//     const profileConfig = tableData.map(row => ({
//       field: row.field,
//       required: row.required,
//       target: row.target,
//       type: row.type
//     }));


//     try {
//       const response = await axios.post('/api/save-profile', { profileName, profileConfig });
//       if (response.data.message === 'Profile configuration saved successfully') {
//         window.location.href = 'index.html';
//       }
//     } catch (error) {
//       console.error('Error saving profile configuration:', error);
//     }
//   };


//   const deleteFile = (fileName) => {
//     const cachedFiles = JSON.parse(localStorage.getItem('cachedFiles')) || [];
//     const updatedFiles = cachedFiles.filter((file) => file.name !== fileName);
//     localStorage.setItem('cachedFiles', JSON.stringify(updatedFiles));
//     setFileList(updatedFiles);
//   };

//     return (
//     <div className="Dashboard">
//       <div className="header">
//         <div className="menu-icon" onClick={toggleSidebar}>
//           &#9776;
//         </div>
//         <div className="title">Anomaly Detection</div>
//         <div className="sign-out" onClick={() => (window.location.href = '/')}>Sign-out</div>
//       </div>
//       <div className={`sidebar ${sidebarOpen ? '' : 'closed'}`}>
//         <div className="dropdown" onClick={() => toggleDropdown('import')}>
//           {profileName === '' ? `Create Profile` : profileName}
//         </div>
//         <ul className={`dropdown-list ${dropdownOpen.import ? 'open' : 'closed'}`}>
//           <li>
//             <select id="profileSelect">
//               <option value="">Select Profile</option>
//               {profiles.map((profile, index) => (
//                 <option key={index} value={profile}>{profile}</option>
//               ))}
//             </select>
//           </li>
//           <ul className={`dropdown-list ${dropdownOpen.import ? 'open' : 'closed'}`}>
//             <li onClick={() => toggleDropdown('files')}>view previous files</li>
//           </ul>
//           <ul className={`dropdown-list ${dropdownOpen.files ? 'open' : 'closed'}`}>
//             {fileList.length > 0 &&
//               fileList.map((file, index) => (
//                 <li key={index}>
//                   <span onClick={() => fetchHeaders(file.name)}>
//                     {file.name}
//                   </span>
//                   <span className="delete-icon" onClick={() => deleteFile(file.name)}>🗑️</span>
//                 </li>
//               ))}
//           </ul>
//           <li onClick={() => toggleDropdown('upload')}>Upload files</li>
//           <ul className={`dropdown-list ${dropdownOpen.upload ? 'open' : 'closed'}`}>
//             <li>
//               <label className="custom-file-upload">
//                 Choose file
//                 <input type="file" onChange={handleFileUpload} />
//               </label>
//               <div className={uploadSuccess ? 'success' : ''}>
//                 {uploadSuccess ? 'Uploaded ✔' : ''}
//               </div>
//             </li>
//           </ul>
//         </ul>
//         <div className="dropdown" onClick={() => toggleDropdown('operations')}>Operations</div>
//         <ul className={`dropdown-list ${dropdownOpen.operations ? 'open' : 'closed'}`}>
//           <li onClick={mergeFiles}>Merge Files</li>
//           <li>Data Cleansing</li>
//           <li>Data Profiling</li>
//         </ul>
//       </div>
//       <div className={`content ${sidebarOpen ? '' : 'shift'}`}>
//         <div className="file-upload-container">
//           <div id="tableContainer">
//             {headers.length > 0 && (
//               <table>
//                 <thead>
//                   <tr>
//                     <th>Fields</th>
//                     <th>Required/Not Required</th>
//                     <th>Target</th>
//                     <th>Type</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {tableData.map((row, index) => (
//                     <tr key={index}>
//                       <td>{row.field}</td>
//                       <td>
//                         <input
//                           type="checkbox"
//                           className="required-checkbox"
//                           name="required"
//                           checked={row.required}
//                           onChange={(e) => handleInputChange(index, e)}
//                         />
//                       </td>
//                       <td>
//                         <input
//                           type="text"
//                           className="target-input"
//                           name="target"
//                           value={row.target}
//                           onChange={(e) => handleInputChange(index, e)}
//                         />
//                       </td>
//                       <td>
//                         <select
//                           className="type-select"
//                           name="type"
//                           value={row.type}
//                           onChange={(e) => handleInputChange(index, e)}
//                         >
//                           <option value="dimension">Dimension</option>
//                           <option value="measure">Measure</option>
//                         </select>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//           {!profileCreated &&
//             <div>
//               <input
//                 type="text"
//                 id="profileName"
//                 placeholder="Enter Profile Name"
//                 value={profileName}
//                 onChange={(e) => setProfileName(e.target.value)}
//               />
//               <button onClick={() => setProfileCreated(true)}>Save</button>
//             </div>
//           }
//           {uploadSuccess &&
//             <button onClick={saveConfiguration}>Save Configuration</button>
//           }
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Dashboard;
