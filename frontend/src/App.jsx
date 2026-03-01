import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PMLayout from "./layouts/PMLayout";
import Dashboard from "./pages/PM/Dashboard";
import { PMProvider } from "./context/PMContext";

import Projects from "./pages/PM/Projects";
import Tasks from "./pages/PM/Tasks";
import Workers from "./pages/PM/Workers";
import Issues from "./pages/PM/Issues";
import DailyReports from "./pages/PM/DailyReports";
import SafetyNotices from "./pages/PM/SafetyNotices";

const App = () => {
    return (
        <PMProvider>
            <Routes>
                <Route path="/" element={<Navigate to="/pm/dashboard" replace />} />
                <Route path="/pm" element={<PMLayout />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="tasks" element={<Tasks />} />
                    <Route path="workers" element={<Workers />} />
                    <Route path="issues" element={<Issues />} />
                    <Route path="reports" element={<DailyReports />} />
                    <Route path="safety" element={<SafetyNotices />} />
                </Route>
            </Routes>
        </PMProvider>
    );
};

export default App;