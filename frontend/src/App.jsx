import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import './App.css';
const backendUrl= "https://employeepayrollservice-2.onrender.com";
// require("../../backend/index")
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
      await axios.post(`http://localhost:3003/importUser`, formData, {
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

  return (
    <div className="App">
      <h1>PayRoll</h1>
      <form onSubmit={handleFileUpload}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload Excel</button>
      </form>
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
            <th>Date</th>
            <th>Day</th>
            <th>Punch In Time</th>
            <th>Punch Out Time</th>
            <th>Status</th>
            <th>Working Hrs</th>
            <th>Break Hrs</th>
            <th>Hourly Rate</th>
            <th>Penalty Rate</th>
            <th>Daily Salary</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.EmployeeID}>
              <td>{user.EmployeeID}</td>
              <td>{user.EmployeeName}</td>
              <td>{user.Date}</td>
              <td>{user.Day}</td>
              <td>{user.PunchInTime}</td>
              <td>{user.PunchOutTime}</td>
              <td>{user.Status}</td>
              <td>{user.WorkingHrs}</td>
              <td>{user.BreakHrs}</td>
              <td>{user.HourlyRate}</td>
              <td>{user.penaltyRate}</td>
              <td>{user.DailySalary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
