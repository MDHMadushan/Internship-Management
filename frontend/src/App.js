import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Layout from './components/layout/Layout';

// Admin Components
import Dashboard from './components/admin/Dashboard';
import UserManagement from './components/admin/UserManagement';
import ProjectManagement from './components/admin/ProjectManagement';
import TaskManagement from './components/admin/TaskManagement';
import AdminDailyLogs from './components/admin/AdminDailyLogs';
import Reports from './components/admin/Reports';

// Intern Components
import InternDashboard from './components/intern/InternDashboard';
import MyTasks from './components/intern/MyTasks';
import DailyLog from './components/intern/DailyLog';
import MyProjects from './components/intern/MyProjects';

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px'
            }}>
                Loading...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        // Redirect intern to intern dashboard, admin to admin dashboard
        if (user.role === 'INTERN') {
            return <Navigate to="/intern-dashboard" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return <Layout>{children}</Layout>;
};

function App() {
    return (
        <AuthProvider>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                        borderRadius: '10px',
                    },
                    success: {
                        icon: '✅',
                    },
                    error: {
                        icon: '❌',
                    },
                }}
            />
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/admin" element={<Navigate to="/dashboard" replace />} />

                    {/* ========== ADMIN ROUTES ========== */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute roles={['ADMIN']}>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            <ProtectedRoute roles={['ADMIN']}>
                                <UserManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/projects"
                        element={
                            <ProtectedRoute roles={['ADMIN']}>
                                <ProjectManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/tasks"
                        element={
                            <ProtectedRoute roles={['ADMIN']}>
                                <TaskManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/daily-logs-admin"
                        element={
                            <ProtectedRoute roles={['ADMIN']}>
                                <AdminDailyLogs />
                            </ProtectedRoute>
                        }
                    />

                    {/* ========== INTERN ROUTES ========== */}
                    <Route
                        path="/intern-dashboard"
                        element={
                            <ProtectedRoute roles={['INTERN']}>
                                <InternDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/my-tasks"
                        element={
                            <ProtectedRoute roles={['INTERN']}>
                                <MyTasks />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/my-projects"
                        element={
                            <ProtectedRoute roles={['INTERN']}>
                                <MyProjects />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/daily-logs"
                        element={
                            <ProtectedRoute roles={['INTERN']}>
                                <DailyLog />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/reports"
                        element={
                            <ProtectedRoute roles={['ADMIN']}>
                                <Reports />
                            </ProtectedRoute>
                        }
                    />

                    {/* Fallback Route */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;