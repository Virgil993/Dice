import { useState, React } from 'react'
import './styles/App.css'
import Home from './views/Home'
import 'bootstrap/dist/css/bootstrap.min.css';
import {} from "reactstrap"
import Register from './views/Register';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Profile from './views/Profile';
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import AdminLayout from './layouts/Admin';
import AuthLayout from './layouts/Auth';

function App() {

  return (
      <div className='app'>
        <BrowserRouter>
          <Routes>
            <Route
              path="/admin/dashboard"
              element={<AdminLayout element={<Dashboard />} />}
            />
            <Route path="/auth/login" element={<AuthLayout element={<Login />} />} />
            <Route
              path="/auth/register"
              element={<AuthLayout element={<Register />} />}
            />
            <Route path="/auth/home" element={<AuthLayout element={<Home />} />} />
            <Route path="/admin/profile" element={<AdminLayout element={<Profile />} />} />
            <Route path="*" element={<Navigate to="/auth/home" />} />
          </Routes>
        </BrowserRouter>
      </div>
  )
}

export default App
