import React from 'react';
import { Link } from 'react-router-dom';

const PMSidebar = () => {
    return (
        <aside className="w-64 h-screen bg-gray-900 text-white p-4 flex flex-col">
            <div className="text-2xl font-bold mb-8 tracking-wide">
                SiteNex <span className="text-blue-400">PM</span>
            </div>
            <nav className="flex flex-col gap-2">
                <Link to="/pm/dashboard" className="p-3 hover:bg-gray-800 rounded transition-colors">Dashboard</Link>
                <Link to="/pm/projects" className="p-3 hover:bg-gray-800 rounded transition-colors">Projects</Link>
                <Link to="/pm/tasks" className="p-3 hover:bg-gray-800 rounded transition-colors">Tasks</Link>
                <Link to="/pm/workers" className="p-3 hover:bg-gray-800 rounded transition-colors">Workers</Link>
                <Link to="/pm/issues" className="p-3 hover:bg-gray-800 rounded transition-colors">Issues</Link>
                <Link to="/pm/reports" className="p-3 hover:bg-gray-800 rounded transition-colors">Daily Reports</Link>
                <Link to="/pm/safety" className="p-3 hover:bg-gray-800 rounded transition-colors">Safety & Notices</Link>
            </nav>
        </aside>
    );
};

export default PMSidebar;
