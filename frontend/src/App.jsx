import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PMLayout from "./layouts/PMLayout";
import Dashboard from "./pages/PM/Dashboard";

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/pm/dashboard" replace />} />
            <Route path="/pm" element={<PMLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                {/* Placeholders for other routes */}
                <Route path="projects" element={<div className="p-6">Projects Page</div>} />
                <Route path="tasks" element={<div className="p-6">Tasks Page</div>} />
                <Route path="workers" element={<div className="p-6">Workers Page</div>} />
                <Route path="issues" element={<div className="p-6">Issues Page</div>} />
                <Route path="reports" element={<div className="p-6">Daily Reports Page</div>} />
                <Route path="safety" element={<div className="p-6">Safety Page</div>} />
            </Route>
        </Routes>
    );
};

export default App;