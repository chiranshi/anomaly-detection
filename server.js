const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const Papa = require('papaparse');
const { v4: uuidv4 } = require('uuid'); // Import uuid for generating unique IDs
const cors = require('cors'); // Import cors middleware
 
const app = express();
const upload = multer({ dest: 'uploads/' });
const profilesDir = path.join(__dirname, '../data/profiles');
const profileListPath = path.join(__dirname, '../data/Profile_List.json');
 
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../')));
app.use(cors()); // Use cors middleware
 
// Ensure PROFILES directory exists
fs.ensureDirSync(profilesDir);
 
// Load profile list or create an empty one
if (!fs.existsSync(profileListPath)) {
fs.writeJsonSync(profileListPath, []);
}
 
// Fetch profiles
app.get('/profiles', (req, res) => {
const profiles = fs.readJsonSync(profileListPath);
res.json(profiles);
});
 
app.post('/profiles', upload.single('sampleFile'), (req, res) => {
const profileName = req.body.profileName;
const profilePath = path.join(profilesDir, profileName);
 
if (!profileName || !req.file) {
return res.status(400).send('Profile name and sample file are required.');
}
 
// Create profile folder
fs.ensureDirSync(profilePath);
 
// Move uploaded sample file to profile folder
const sampleFilePath = path.join(profilePath, req.file.originalname);
fs.moveSync(req.file.path, sampleFilePath);
 
// Initialize profile details
const profileDetails = {
id: uuidv4(),
name: profileName,
sampleFile: req.file.originalname,
fields: JSON.parse(req.body.fields)
};
 
// Save profile details as JSON
fs.writeJsonSync(path.join(profilePath, 'name.json'), profileDetails);
 
// Update profile list
const profiles = fs.readJsonSync(profileListPath);
profiles.push({id: profileDetails.id,
  name: profileName,
  path:sampleFilePath});
fs.writeJsonSync(profileListPath, profiles);
 
res.send('Profile created successfully.');
});
 
app.post('/profiles/:profileName/upload', upload.single('dataFile'), (req, res) => {
  const profileName = req.params.profileName;
  const profilePath = path.join(profilesDir, profileName);
  const profileDetailsPath = path.join(profilePath, 'name.json');
  
  if (!fs.existsSync(profileDetailsPath)) {
    return res.status(404).send('Profile not found.');
  }
  
  const profileDetails = fs.readJsonSync(profileDetailsPath);
  const uploadedData = fs.readFileSync(req.file.path, 'utf8');
  const uploadedLines = uploadedData.split('\n');
  const uploadedHeaders = uploadedLines[0].split(',').map(header => header.trim());

  // Filter fields based on the saved profile configuration
  const requiredFields = profileDetails.fields.filter(field => field.required);
  const filteredHeaders = requiredFields.map(field => field.field);

  // Find indices of required fields in uploaded headers
  const headerIndices = filteredHeaders.map(header => uploadedHeaders.indexOf(header));

  // Check if no headers matched
  if (headerIndices.some(index => index === -1)) {
    return res.status(400).json({ message: 'Uploaded file is not compatible with the required format.' });
  }

  // Filter the data based on required headers
  const filteredData = uploadedLines.map(line => {
    const columns = line.split(',');
    return headerIndices.map(index => columns[index]).join(',');
  }).join('\n');

  // Save the filtered data as {Profile name}_filtered.csv
  const filteredFilePath = path.join(profilePath, `${profileName}_filtered.csv`);
  fs.writeFileSync(filteredFilePath, filteredData);

  // Move uploaded file to profile folder
  const dataFilePath = path.join(profilePath, req.file.originalname);
  fs.moveSync(req.file.path, dataFilePath);

  res.json({
    message: 'Uploaded file is compatible with the given format',
    dataFilePath: dataFilePath // Include the path in the response
    // preview: filteredData.split('\n').slice(0, 5).join('\n')
  });
});

 
// On profile selection sample file appears
app.get('/profiles/', (req, res) => {
const profileName = req.params.profileName;
const profilePath = path.join(profilesDir, profileName, `id.json`);
 
if (!fs.existsSync(profilePath)) {
return res.status(404).send('Profile not found.');
}
 
const profileDetails = fs.readJsonSync(profilePath);
const sampleFilePath = path.join(profilesDir, profileName, 'sampledata.csv');
 
if (!fs.existsSync(sampleFilePath)) {
return res.status(404).send('Sample file not found.');
}
 
const sampleFileContent = fs.readFileSync(sampleFilePath, 'utf8');
 
res.json({
profileDetails,
sampleFileContent
});
});
 
// Save current or historical file
app.post('/profiles/:profileName/save', (req, res) => {
const profileName = req.params.profileName;
const type = req.query.type;
const profilePath = path.join(profilesDir, profileName);
const latestFile = fs.readdirSync(profilePath).filter(file => file !== 'name.json').pop();
 
if (!latestFile) {
return res.status(400).send('No file uploaded to save.');
}
 
const destinationPath = path.join(profilePath, `${type}_file.csv`);
fs.copySync(path.join(profilePath, latestFile), destinationPath);
 
res.send(`${type.charAt(0).toUpperCase() + type.slice(1)} file saved successfully.`);
});
 
const PORT = 4000;
app.listen(PORT, () => {
console.log(`Server is running on port ${PORT}`);
});