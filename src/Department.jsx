import React, { useState } from 'react';
import axios from 'axios';

function DepartmentSelect() {
    const [selectedDept1, setSelectedDept1] = useState('');
    const [selectedDept2, setSelectedDept2] = useState('');
    const [selectedDept3, setSelectedDept3] = useState('');

    const departments = [
        { label: "Engineering", value: "engineering" },
        { label: "Human Resources", value: "hr" },
        { label: "Marketing", value: "marketing" },
        { label: "Sales", value: "sales" },
        { label: "Finance", value: "finance" }
    ];

    const handleDeptChange = (e, deptNumber) => {
        const value = e.target.value;
        if (deptNumber === 1) setSelectedDept1(value);
        if (deptNumber === 2) setSelectedDept2(value);
        if (deptNumber === 3) setSelectedDept3(value);
    };

    const handleSubmit = async () => {
        const filename = `${selectedDept1}-${selectedDept2}-${selectedDept3}`;
        const formData = new FormData();
        formData.append('filename', filename);

        try {
            const response = await axios.post('/api/upload', formData);
            console.log('Response:', response.data);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div>
                <label htmlFor="dept1">Select Department 1:</label>
                <select
                    id="dept1"
                    value={selectedDept1}
                    onChange={(e) => handleDeptChange(e, 1)}
                    style={{ marginLeft: '10px' }}
                >
                    <option value="">--Select--</option>
                    {departments.map((dept, index) => (
                        <option key={index} value={dept.value}>
                            {dept.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="dept2" style={{ marginTop: '10px' }}>Select Department 2:</label>
                <select
                    id="dept2"
                    value={selectedDept2}
                    onChange={(e) => handleDeptChange(e, 2)}
                    style={{ marginLeft: '10px' }}
                >
                    <option value="">--Select--</option>
                    {departments.map((dept, index) => (
                        <option key={index} value={dept.value}>
                            {dept.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="dept3" style={{ marginTop: '10px' }}>Select Department 3:</label>
                <select
                    id="dept3"
                    value={selectedDept3}
                    onChange={(e) => handleDeptChange(e, 3)}
                    style={{ marginLeft: '10px' }}
                >
                    <option value="">--Select--</option>
                    {departments.map((dept, index) => (
                        <option key={index} value={dept.value}>
                            {dept.label}
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ marginTop: '20px' }}>
                <button onClick={handleSubmit}>Submit</button>
            </div>
        </div>
    );
}

export default DepartmentSelect;
