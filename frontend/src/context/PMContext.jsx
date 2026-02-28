import React, { createContext, useState } from 'react';
// Importing dummy data to emulate initial backend state
import { projects, tasks, workers, issues, dailyReports, safetyObservations, stopHoldNotices } from '../assets/dummyData';

export const PMContext = createContext();

export const PMProvider = ({ children }) => {
    const [data, setData] = useState({
        projects,
        tasks,
        workers,
        issues,
        dailyReports,
        safetyObservations,
        stopHoldNotices
    });

    return (
        <PMContext.Provider value={{ data, setData }}>
            {children}
        </PMContext.Provider>
    );
};
