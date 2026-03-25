import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import PMLayout from "./layouts/PMLayout";
import SELayout from "./layouts/SELayout";
import Dashboard from "./pages/PM/Dashboard";
import { PMProvider } from "./context/PMContext";
import { SEProvider } from "./context/SEContext";
import RoleGuard from "./components/RoleGuard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Projects from "./pages/PM/Projects";
import Tasks from "./pages/PM/Tasks";
import Workers from "./pages/PM/Workers";
import Issues from "./pages/PM/Issues";
import DailyReports from "./pages/PM/DailyReports";
import SafetyNotices from "./pages/PM/SafetyNotices";
import ToolsEquipment from './pages/PM/ToolsEquipment';

import SEDashboard from "./pages/SE/SEDashboard";
import SETasks from "./pages/SE/SETasks";
import SEApprovals from "./pages/SE/SEApprovals";
import SEMaterials from "./pages/SE/SEMaterials";
import SEDailyReports from "./pages/SE/SEDailyReports";
import SESafetyNotices from "./pages/SE/SESafetyNotices";
import SEIssues from "./pages/SE/SEIssues";

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-pulse text-xl text-gray-500 font-bold">Loading...</div></div>;
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-pulse text-xl text-gray-500 font-bold">Loading...</div></div>;
    return isAuthenticated ? <RoleGuard /> : children;
};

const App = () => {
    return (
        <PMProvider>
            <ToastContainer position="top-right" />
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                {/* Root redirect */}
                <Route path="/" element={
                    <PrivateRoute><RoleGuard /></PrivateRoute>
                } />

                {/* Protected PM Routes */}
                <Route path="/pm" element={
                    <PrivateRoute><PMLayout /></PrivateRoute>
                }>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="tasks" element={<Tasks />} />
                    <Route path="workers" element={<Workers />} />
                    <Route path="issues" element={<Issues />} />
                    <Route path="tools" element={<ToolsEquipment />} />
                    <Route path="reports" element={<DailyReports />} />
                    <Route path="safety" element={<SafetyNotices />} />
                </Route>

                {/* Protected SE Routes — wrapped in SEProvider */}
                <Route path="/se" element={
                    <PrivateRoute><SEProvider><SELayout /></SEProvider></PrivateRoute>
                }>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<SEDashboard />} />
                    <Route path="tasks" element={<SETasks />} />
                    <Route path="approvals" element={<SEApprovals />} />
                    <Route path="materials" element={<SEMaterials />} />
                    <Route path="issues" element={<SEIssues />} />
                    <Route path="safety-notices" element={<SESafetyNotices />} />
                    <Route path="daily-reports" element={<SEDailyReports />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </PMProvider>
    );
};


export default App;