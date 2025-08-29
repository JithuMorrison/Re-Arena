import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './Navbar';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import TherapistDashboard from './TherapistDashboard';
import InstructorDashboard from './InstructorDashboard';
import UserDashboard from './UserDashboard';
import { AuthProvider } from './AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/therapist" element={<TherapistDashboard />} />
            <Route path="/instructor" element={<InstructorDashboard />} />
            <Route path="/user" element={<UserDashboard />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;