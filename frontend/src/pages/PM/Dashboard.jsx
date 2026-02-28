import React, { useState, useEffect } from 'react';
import { projects, tasks, issues } from '../../../assets/dummyData';

const Dashboard = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">PM Dashboard</h1>
            <p>Overview of projects, issues, worker status, and AI delays will go here.</p>
        </div>
    );
};

export default Dashboard;
