import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { supabase } from './supabase';
import { Download } from 'lucide-react';


// Initialize Supabase client (add this near the top of your file, outside the component)


function App() {
    const [file, setFile] = useState(null);
    const [department, setDepartment] = useState('');
    const [type, setType] = useState('');
    const [location, setLocation] = useState('');
    const [message, setMessage] = useState('');
    const [filesList, setFilesList] = useState([]);
    const [activeTab, setActiveTab] = useState('upload');
    const [fileStatuses, setFileStatuses] = useState({});
    const [amount, setAmount] = useState('');
    const [uploadStatus, setUploadStatus] = useState('Under Process');
    const [projectName, setProjectName] = useState('');
    const [uploadedBy, setUploadedBy] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    const departments = [
        { label: "AIIA", value: "12Ip6Gtds0sPrEPiuOhp9DxBam9H2K4Of" },
        { label: "AIIMS", value: "18A6Usa7_AuZRs23Zny3fn_uOAg1-Xmnq" },
        { label: "NIHFW", value: "1wsYdm93h0FqaRA2OCy9ipoLI20ey5EXT" },
        { label: "ALIMCO", value: "1lyM84IqeNNNbJOgUSMwWq2j-eIbS-jMt" },
    ];

    const types = ["Billing", "Estimate", "General"];
    const locations = ["At Client Office", "At Office", "At NCCF"];

    const statusOptions = [
    
        "Under Process",
        "Finished"
    ];

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file || !department || !type || !location || !projectName || !uploadedBy) {
            setMessage('Please fill in all required fields');
            setMessageType('error');
            return;
        }

        const filename = `${projectName} | ${type} | ${location}`;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('filename', filename);
        formData.append('departmentId', department);
        formData.append('uploadedBy', uploadedBy);

        try {
            // Upload file to backend
            const response = await axios.post('https://fms-backend-imgd.onrender.com/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // Insert record into Supabase
            const { data, error } = await supabase
                .from('files')
                .insert([
                    {
                        file_id: response.data.fileId,
                        file_name: filename,
                        amount: amount || null,
                        status: uploadStatus,
                        uploaded_by: uploadedBy
                    }
                ]);

            if (error) throw error;
            
            setMessage('File uploaded successfully and recorded in database');
            setMessageType('success');
            
            // Clear form fields after successful upload
            setFile(null);
            setProjectName('');
            setAmount('');
            // Reset file input
            const fileInput = document.getElementById('file-upload');
            if (fileInput) fileInput.value = '';
            
        } catch (error) {
            console.error('Error:', error);
            setMessage('Upload failed: ' + (error.message || 'Unknown error'));
            setMessageType('error');
        }
    };

    const fetchFiles = async () => {
        if (!department) {
            setMessage('Please select a department');
            return;
        }

        try {
            // Build query parameters using the selected values
            const params = new URLSearchParams({
                folderId: department,
                type: type || '', // Send selected type from dropdown
                location: location || '' // Send selected location from dropdown
            });

            // First fetch files from Google Drive with filters
            const response = await axios.get(`https://fms-backend-imgd.onrender.com/fetch-files?${params.toString()}`);
            
            // Then fetch corresponding data from Supabase for all files
            const { data: supabaseData, error } = await supabase
                .from('files')
                .select('*')
                .in('file_id', response.data.files.map(file => file.id));

            if (error) throw error;

            // Merge Google Drive data with Supabase data
            const mergedFiles = response.data.files.map(driveFile => {
                const supabaseFile = supabaseData.find(dbFile => dbFile.file_id === driveFile.id);
                return {
                    ...driveFile,
                    amount: supabaseFile?.amount || null,
                    status: supabaseFile?.status || 'Under Process'
                };
            });

            setFilesList(mergedFiles);
            setMessage(`${mergedFiles.length} files fetched`);
        } catch (error) {
            console.error('Error:', error);
            setMessage('Failed to fetch files');
        }
    };

    const handleStatusChange = async (fileId, newStatus) => {
        try {
            // Update local state
            setFileStatuses(prev => ({
                ...prev,
                [fileId]: newStatus
            }));

            // Update status in Supabase
            const { error } = await supabase
                .from('files')
                .update({ status: newStatus })
                .eq('file_id', fileId);

            if (error) throw error;
            setMessage(`Status updated successfully for file ${fileId}`);
        } catch (error) {
            console.error('Error updating status:', error);
            setMessage('Failed to update status');
            // Revert local state on error
            setFileStatuses(prev => ({
                ...prev,
                [fileId]: prev[fileId]
            }));
        }
    };

    const handleViewFile = async (fileId) => {
        try {
            const response = await axios.get(`https://fms-backend-imgd.onrender.com/view-file/${fileId}`);
            
            // Create an anchor element
            const link = document.createElement('a');
            link.href = response.data.viewLink;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            
            // Programmatically click the link
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            setMessage('Failed to view file');
            console.error('Error:', error);
        }
    };

    const handleDownloadFile = async (fileId, fileName) => {
        try {
            const response = await axios.get(`https://fms-backend-imgd.onrender.com/download-file/${fileId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            setMessage('Failed to download file');
        }
    };

    // Add this useEffect for auto-dismissing messages
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
                setMessageType('');
            }, 5000); // Message will disappear after 5 seconds

            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <div className="container">
            <h2 className="title">SHC Document Management System</h2>

            <div className="tabs">
                <button 
                    className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
                    onClick={() => setActiveTab('upload')}
                >
                    Upload Files
                </button>
                <button 
                    className={`tab ${activeTab === 'fetch' ? 'active' : ''}`}
                    onClick={() => setActiveTab('fetch')}
                >
                    Fetch Files
                </button>
            </div>

            {/* Message Alert */}
            {message && (
                <div className="message-container">
                    <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}>
                        {message}
                    </div>
                </div>
            )}

            {activeTab === 'upload' ? (
                <div className="upload-form">
                    <div className="form-grid">
                        {/* Left Column */}
                        <div className="form-column">
                            {/* Project Name Input - New */}
                            <div className="form-group">
                                <label htmlFor="project-name">Project Name</label>
                                <input
                                    type="text"
                                    id="project-name"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="text-input"
                                    placeholder="Enter project name"
                                    required
                                />
                            </div>

                            {/* Department Dropdown */}
                            <div className="form-group">
                                <label htmlFor="department">Department</label>
                                <select
                                    id="department"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="select-input"
                                    required
                                >
                                    <option value="">--Select Department--</option>
                                    {departments.map((dept) => (
                                        <option key={dept.value} value={dept.value}>
                                            {dept.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Type Dropdown */}
                            <div className="form-group">
                                <label htmlFor="type">Document Type</label>
                                <select
                                    id="type"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="select-input"
                                    required
                                >
                                    <option value="">--Select Type--</option>
                                    {types.map((typeOption) => (
                                        <option key={typeOption} value={typeOption}>
                                            {typeOption}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="form-column">
                            {/* Uploaded By Input - New */}
                            <div className="form-group">
                                <label htmlFor="uploaded-by">Uploaded By</label>
                                <input
                                    type="text"
                                    id="uploaded-by"
                                    value={uploadedBy}
                                    onChange={(e) => setUploadedBy(e.target.value)}
                                    className="text-input"
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>

                            {/* Location Dropdown */}
                            <div className="form-group">
                                <label htmlFor="location">Location</label>
                                <select
                                    id="location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="select-input"
                                    required
                                >
                                    <option value="">--Select Location--</option>
                                    {locations.map((locationOption) => (
                                        <option key={locationOption} value={locationOption}>
                                            {locationOption}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Amount Input */}
                            <div className="form-group">
                                <label htmlFor="amount">Amount</label>
                                <input
                                    type="number"
                                    id="amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="number-input"
                                    placeholder="Enter amount"
                                />
                            </div>
                        </div>
                    </div>

                    {/* File Upload and Status - Bottom Section */}
                    <div className="form-bottom">
                        <div className="form-group">
                            <label htmlFor="upload-status">Status</label>
                            <select
                                id="upload-status"
                                value={uploadStatus}
                                onChange={(e) => setUploadStatus(e.target.value)}
                                className="select-input"
                            >
                                {statusOptions.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="file-upload">Upload File</label>
                            <input 
                                id="file-upload"
                                type="file" 
                                onChange={handleFileChange}
                                className="file-input"
                                required
                            />
                        </div>
                    </div>

                    <button onClick={handleUpload} className="btn btn-primary">
                        Upload Document
                    </button>
                </div>
            ) : (
                <div className="fetch-container">
                    {/* Left sidebar with form controls (1/3) */}
                    <div className="fetch-form">
                        <div className="form-group">
                            <label htmlFor="fetch-department">Department</label>
                            <select
                                id="fetch-department"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="select-input"
                            >
                                <option value="">--Select Department--</option>
                                {departments.map((dept) => (
                                    <option key={dept.value} value={dept.value}>
                                        {dept.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="fetch-type">Document Type</label>
                            <select
                                id="fetch-type"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="select-input"
                            >
                                <option value="">--Select Type--</option>
                                {types.map((typeOption) => (
                                    <option key={typeOption} value={typeOption}>
                                        {typeOption}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="fetch-location">Location</label>
                            <select
                                id="fetch-location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="select-input"
                            >
                                <option value="">--Select Location--</option>
                                {locations.map((locationOption) => (
                                    <option key={locationOption} value={locationOption}>
                                        {locationOption}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button onClick={fetchFiles} className="btn btn-primary">
                            Fetch Files
                        </button>
                    </div>

                    {/* Right section with files table (2/3) */}
                    <div className="files-section">
                        <h3>Files in Folder</h3>
                        {filesList.length > 0 ? (
                            <table className="files-table">
                                <thead>
                                    <tr>
                                        <th>File Name</th>
                                        <th>Value</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filesList.map((file) => (
                                        <tr key={file.id} className="file-row">
                                            <td className="file-name">{file.name}</td>
                                            <td className="file-value">{file.amount || 'N/A'}</td>
                                            <td>
                                                <select
                                                    className="status-select"
                                                    value={fileStatuses[file.id] || file.status || 'Under Process'}
                                                    onChange={(e) => setFileStatuses(prev => ({
                                                        ...prev,
                                                        [file.id]: e.target.value
                                                    }))}
                                                >
                                                    {statusOptions.map((status) => (
                                                        <option key={status} value={status}>
                                                            {status}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => handleStatusChange(file.id, fileStatuses[file.id] || file.status)}
                                                    className="btn btn-update btn-sm"
                                                >
                                                    Update
                                                </button>
                                            </td>
                                            <td className="file-actions">
                                                <button
                                                    onClick={() => handleViewFile(file.id)}
                                                    className="btn btn-secondary btn-sm"
                                                >
                                                    View
                                                </button>
                                                {/* <button
                                                    onClick={() => handleDownloadFile(file.id, file.name)}
                                                    className="btn btn-success btn-sm btn-icon"
                                                >
                                                    <Download size={16} />
                                                </button> */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No files found</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
