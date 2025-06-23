// frontend/src/App.js

import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

// IMPORTANT: Replace this with your actual backend URL from the Cloud Run deployment
const API_BASE_URL = 'https://api-backend-tzgb3x3t4a-uc.a.run.app';

function App() {
  // Use a single state object to hold all form data
  const [formData, setFormData] = useState({
    job_title: '',
    department: '',
    manager: '',
    level: '',
    salary_range: '',
    benefits_perks: '',
    locations: '',
    urgency: 'Medium', // Default value
    other_remarks: '',
    employment_type: 'Permanent', // Default value
    hiring_type: 'External' // Default value
  });

  const [statusMessage, setStatusMessage] = useState('');

  // A single handler for all input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser form submission
    setStatusMessage('Submitting...');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/hiring-requests`, formData);
      console.log('Success:', response.data);
      setStatusMessage(`Success! Hiring Request created with ID: ${response.data.id}`);
      // Optionally, reset the form
      // setFormData({ ...initial state ... }); 
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatusMessage('Error: Could not submit the request.');
    }
  };

  return (
    <div className="app-container">
      <div className="form-container">
        <h1>New Hiring Request</h1>
        <form onSubmit={handleSubmit}>
          
          <div className="form-row">
            <div className="form-group">
              <label>Job Title</label>
              <input type="text" name="job_title" value={formData.job_title} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input type="text" name="department" value={formData.department} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Hiring Manager</label>
              <input type="text" name="manager" value={formData.manager} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Level</label>
              <input type="text" name="level" value={formData.level} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Salary Range</label>
              <input type="text" name="salary_range" value={formData.salary_range} onChange={handleChange} />
            </div>
             <div className="form-group">
              <label>Locations</label>
              <input type="text" name="locations" value={formData.locations} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Benefits & Perks</label>
            <textarea name="benefits_perks" value={formData.benefits_perks} onChange={handleChange} />
          </div>

          <div className="form-row">
             <div className="form-group">
              <label>Urgency</label>
              <select name="urgency" value={formData.urgency} onChange={handleChange}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
             <div className="form-group">
              <label>Employment Type</label>
              <select name="employment_type" value={formData.employment_type} onChange={handleChange}>
                <option value="Permanent">Permanent</option>
                <option value="Temporary">Temporary</option>
              </select>
            </div>
             <div className="form-group">
              <label>Hiring Type</label>
              <select name="hiring_type" value={formData.hiring_type} onChange={handleChange}>
                <option value="External">External</option>
                <option value="Internal">Internal</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Other Remarks</label>
            <textarea name="other_remarks" value={formData.other_remarks} onChange={handleChange} />
          </div>

          <button type="submit" className="submit-btn">Create Request</button>
        </form>
        {statusMessage && <p className="status-message">{statusMessage}</p>}
      </div>
    </div>
  );
}

export default App;