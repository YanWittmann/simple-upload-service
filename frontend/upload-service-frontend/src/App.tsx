import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { StudentView } from './components/StudentView';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-100 py-8">
                <div className="container mx-auto px-4">
                    <Routes>
                        <Route path="/" element={<StudentView/>}/>
                        <Route path="/admin/login" element={<AdminLogin/>}/>
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute>
                                    <AdminDashboard/>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;

