import React, { useState } from 'react';
import Papa from 'papaparse';
import './fileupload.css';

function FileUpload() {
  const [headers, setHeaders] = useState([]);
  const [tableData, setTableData] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: function(results) {
          setHeaders(results.meta.fields);
          displayTable(results.meta.fields);
        }
      });
    }
  };

  const displayTable = (headers) => {
    const initialTableData = headers.map(header => ({
      field: header,
      required: false,
      target: header,
      type: 'dimension'
    }));
    setTableData(initialTableData);
  };

  const handleInputChange = (index, event) => {
    const { name, value, checked, type } = event.target;
    const updatedTableData = [...tableData];
    updatedTableData[index][name] = type === 'checkbox' ? checked : value;
    setTableData(updatedTableData);
  };

  const saveConfiguration = () => {
    const json = JSON.stringify(tableData, null, 2);
    localStorage.setItem('configData', json);
    // Redirect to next page
    window.location.href = '/next_page';
  };

  return (
    <div className="file-upload-container">
      <input type="file" id="fileInput" onChange={handleFileUpload} />
      <div id="tableContainer">
        {headers.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Fields</th>
                <th>Required/Not Required</th>
                <th>Target</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  <td>{row.field}</td>
                  <td>
                    <input
                      type="checkbox"
                      className="required-checkbox"
                      name="required"
                      checked={row.required}
                      onChange={(e) => handleInputChange(index, e)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="target-input"
                      name="target"
                      value={row.target}
                      onChange={(e) => handleInputChange(index, e)}
                    />
                  </td>
                  <td>
                    <select
                      className="type-select"
                      name="type"
                      value={row.type}
                      onChange={(e) => handleInputChange(index, e)}
                    >
                      <option value="dimension">Dimension</option>
                      <option value="measure">Measure</option>
                      <option value="attribute">Attribute</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <button id="saveBtn" onClick={saveConfiguration} style={{ display: headers.length > 0 ? 'block' : 'none' }}>
        Save Configuration
      </button>
    </div>
  );
}

export default FileUpload;
