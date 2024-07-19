import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import './App.css';

import backgroundImage from './assets/3.jpg'; // Import your image


const backendUrl = "https://employeepayrollservice-2.onrender.com";
// const backendUrl = "http://localhost:3003";

function App() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    // Fetch all users when the component mounts
    axios.get(`${backendUrl}/importUser`)
      .then(response => {
        setUsers(response.data);
        setFilteredUsers(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the users!', error);
      });
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    if (e.target.value === '') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(user => user.EmployeeID.includes(e.target.value)));
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`${backendUrl}/importUser`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      // Fetch updated user list after upload
      const response = await axios.get(`${backendUrl}/importUser`);
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('There was an error uploading the file!', error);
    }
  };

  const handleDownloadData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/downloadData`, {
        responseType: 'blob', // Ensure response type is blob
      });
  
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'text/csv' });
  
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
  
      // Create a link element and trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'usersData.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('There was an error downloading the CSV data!', error);
    }
  };
  

  return (
    <div className="App" style={{ 
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed', /* This makes the background image fixed */
      minHeight: '1000vh' // Ensure it covers the full height of the viewport
    }}>
      <h1>PayRoll</h1>
      <form onSubmit={handleFileUpload}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload Excel</button>
      </form>
      <button onClick={handleDownloadData}>Download Data</button>
      <input
        type="text"
        value={search}
        onChange={handleSearch}
        placeholder="Search by Employee ID"
      />
      <table>
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Employee Name</th>
            <th>Mobile No</th>
            <th>Working Hrs</th>
            <th>Break Hrs</th>
            <th>Gross Salary</th>
            <th>Salary</th>
            <th>Day Count</th>
            <th>First Punch</th>
            <th>Last Punch</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.EmployeeID}>
              <td>{user.EmployeeID}</td>
              <td>{user.EmployeeName}</td>
              <td>{user.MobileNo}</td>
              <td>{user.WorkingHrs}</td>
              <td>{user.BreakHrs}</td>
              <td>{user.GrossSalary}</td>
              <td>{user.Salary}</td>
              <td>{user.DayCount}</td>
              <td>{user.PunchInTime}</td>
              <td>{user.PunchOutTime}</td>
    
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
