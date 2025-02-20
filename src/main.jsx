import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Login from './login.jsx'
import AdminLayout from './admin/adminapp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/*" element={<Login />} />
        <Route path="/admin/*" element={<AdminLayout />} />
      </Routes>
    </Router>
  </StrictMode>,
)
