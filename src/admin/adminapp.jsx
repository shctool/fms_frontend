import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import './adminStyles.css';
import { supabase } from '../supabase';
import FileManager from './fileManager';
import * as XLSX from 'xlsx';


const UserProfile = () => {
    const username = localStorage.getItem('user') || 'User';
    
    return (
      <div className="profile-button">
        <span className="profile-icon">👤</span>
        <span className="username">{username}</span>
      </div>
    );
  };

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <button className="modal-close" onClick={onClose}>×</button>
          {children}
        </div>
      </div>
    );
  };
  

const EmployeeForm = ({ onClose, refreshEmployees, initialData = null }) => {
    const [formData, setFormData] = useState({
      first_name: '',
      last_name: '',
      salary: '',
      joining_date: '',
      date_of_birth: '',
      location: '',
      is_active: true,
      department: '',
      designation: '',
      ...initialData
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const isEditing = !!initialData;
  
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
  
      try {
        if (isEditing) {
          const { error } = await supabase
            .from('employees')
            .update({
              ...formData,
              salary: parseFloat(formData.salary)
            })
            .eq('user_id', initialData.user_id);
  
          if (error) throw error;
        } else {
          const user_id = Math.floor(Math.random() * 1000000);
          const { error } = await supabase
            .from('employees')
            .insert([{
              user_id,
              ...formData,
              salary: parseFloat(formData.salary)
            }]);
  
          if (error) throw error;
        }
  
        await refreshEmployees();
        onClose();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <form className="employee-form" onSubmit={handleSubmit}>
        <h2>{isEditing ? 'Edit Employee' : 'Create New Employee'}</h2>
  
        {error && <div className="error-message">{error}</div>}
  
        {/* Personal Information Section */}
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                placeholder="Enter first name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
  
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                placeholder="Enter last name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
  
          <div className="form-row">
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
  
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                placeholder="Enter location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
  
        {/* Employment Details Section */}
        <div className="form-section">
          <h3>Employment Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                name="department"
                placeholder="Enter department"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>
  
            <div className="form-group">
              <label>Designation</label>
              <input
                type="text"
                name="designation"
                placeholder="Enter designation"
                value={formData.designation}
                onChange={handleChange}
                required
              />
            </div>
          </div>
  
          <div className="form-row">
            <div className="form-group">
              <label>Joining Date</label>
              <input
                type="date"
                name="joining_date"
                value={formData.joining_date}
                onChange={handleChange}
                required
              />
            </div>
  
            <div className="form-group">
              <label>Salary</label>
              <input
                type="number"
                name="salary"
                placeholder="Enter salary"
                value={formData.salary}
                onChange={handleChange}
                required
              />
            </div>
          </div>
  
          <div className="form-row">
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
                <span>Active Employee</span>
              </label>
            </div>
          </div>
        </div>
  
        <div className="form-buttons">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Details' : 'Create Employee')}
          </button>
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  };
  
  // Employee Information Modal
  const EmployeeInfoModal = ({ employee, onClose, refreshEmployees }) => {
    const [isEditing, setIsEditing] = useState(false);
  
    if (isEditing) {
      return (
        <EmployeeForm 
          initialData={employee} 
          onClose={() => {
            setIsEditing(false);
            onClose();
          }}
          refreshEmployees={refreshEmployees}
        />
      );
    }
  
    return (
      <div className="employee-info">
        <h2>Employee Information</h2>
        
        <div className="info-section">
          <div className="info-row">
            <strong>Name:</strong>
            <span>{`${employee.first_name} ${employee.last_name}`}</span>
          </div>
          <div className="info-row">
            <strong>Designation:</strong>
            <span>{employee.designation}</span>
          </div>
          <div className="info-row">
            <strong>Department:</strong>
            <span>{employee.department}</span>
          </div>
          <div className="info-row">
            <strong>Location:</strong>
            <span>{employee.location}</span>
          </div>
          <div className="info-row">
            <strong>Salary:</strong>
            <span>₹{employee.salary.toLocaleString()}</span>
          </div>
          <div className="info-row">
            <strong>Joining Date:</strong>
            <span>{new Date(employee.joining_date).toLocaleDateString()}</span>
          </div>
          <div className="info-row">
            <strong>Status:</strong>
            <span className={`status ${employee.is_active ? 'active' : 'inactive'}`}>
              {employee.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
  
        <div className="form-buttons">
          <button 
            className="btn-primary"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
          <button 
            className="btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  };
  
  // HR Management Component
  const HRManagement = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);
  
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .order('joining_date', { ascending: false });
  
        if (error) throw error;
  
        setEmployees(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchEmployees();
    }, []);
  
    const handleViewEmployee = (employee) => {
      setModalContent(
        <EmployeeInfoModal 
          employee={employee}
          onClose={() => {
            setModalContent(null);
            setModalOpen(false);
          }}
          refreshEmployees={fetchEmployees}
        />
      );
      setModalOpen(true);
    };
  
    const handleCreateEmployee = () => {
      setModalContent(
        <EmployeeForm 
          onClose={() => {
            setModalContent(null);
            setModalOpen(false);
          }}
          refreshEmployees={fetchEmployees}
        />
      );
      setModalOpen(true);
    };

    const handleExport = () => {
      setExporting(true);
      try {
        // Prepare data for export
        const exportData = filteredEmployees.map(employee => ({
          'First Name': employee.first_name,
          'Last Name': employee.last_name,
          'Designation': employee.designation,
          'Department': employee.department,
          'Location': employee.location,
          'Salary': employee.salary,
          'Date of Birth': new Date(employee.date_of_birth).toLocaleDateString(),
          'Joining Date': new Date(employee.joining_date).toLocaleDateString(),
          'Status': employee.is_active ? 'Active' : 'Inactive'
        }));
  
        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);
  
        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Employees');
  
        // Generate file name with current date
        const fileName = `employees_${new Date().toISOString().split('T')[0]}.xlsx`;
  
        // Save file
        XLSX.writeFile(wb, fileName);
      } catch (err) {
        setError('Failed to export data. Please try again.');
      } finally {
        setExporting(false);
      }
    };
  
    const filteredEmployees = employees.filter(employee => 
      employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    return (
      <div className="content">
        <div className="header">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="header-buttons">
            <button className='btn-secondary' onClick={handleExport} disabled={exporting || loading || filteredEmployees.length === 0}>
              {exporting ? 'Exporting...' : 'Export as XLSX'}
            </button>
          </div>
          <button className="btn-primary" onClick={handleCreateEmployee}>
            Create Employee
          </button>
        </div>
  
        {error && <div className="error-message">{error}</div>}
  
        <div className="table-container">
          {loading ? (
            <div className="loading">Loading employees...</div>
          ) : (
            <table className="employee-table">
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Designation</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(employee => (
                  <tr key={employee.user_id}>
                    <td>{employee.first_name}</td>
                    <td>{employee.last_name}</td>
                    <td>{employee.designation}</td>
                    <td>{employee.location}</td>
                    <td>
                      <span className={`status ${employee.is_active ? 'active' : 'inactive'}`}>
                        {employee.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-view"
                        onClick={() => handleViewEmployee(employee)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
  
        <Modal isOpen={isModalOpen} onClose={() => {
          setModalContent(null);
          setModalOpen(false);
        }}>
          {modalContent}
        </Modal>
      </div>
    );
  };

  // FMS Component
//   const FileManager = () => {
//     return (
//       <div className="content">
//         <h2>File Manager</h2>
//         <p> This is a component for files and their management</p>
//       </div>
//     );
//   };
  
  // Admin Layout Component
  const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear any auth-related data from localStorage
        localStorage.removeItem('username');
        localStorage.removeItem('token');
        // Redirect to login page
        navigate('/login');
      };
    return (
    
    <div className="app">
    <header className="top-header">
      <UserProfile />
    </header>
    <aside className="sidebar">
      <div className="logo">SHC Admin Panel</div>

      <nav>
        <Link to="/admin/fms" className={location.pathname === '/admin/fms' ? 'active' : ''}>
          FMS
        </Link>
        <Link to="/admin/hrm" className={location.pathname === '/admin/hrm' ? 'active' : ''}>
          HR Management
        </Link>
    
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </nav>
    </aside>
    <main className="main">
      <Routes>
        <Route path="/fms" element={<FileManager />} />
        <Route path="/hrm" element={<HRManagement />} />
      </Routes>
    </main>
  </div>
    );
  };
  
  export default AdminLayout;