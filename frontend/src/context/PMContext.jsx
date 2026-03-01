import React, { createContext, useContext, useState } from 'react';
import {
    projects as initialProjects,
    tasks as initialTasks,
    workers as initialWorkers,
    issues as initialIssues,
    dailyReports as initialReports,
    safetyObservations as initialSafety,
    stopHoldNotices as initialNotices
} from '../assets/dummyData';

const PMContext = createContext();

export const usePMContext = () => useContext(PMContext);

export const PMProvider = ({ children }) => {
    const [projects, setProjects] = useState(initialProjects);
    const [tasks, setTasks] = useState(initialTasks);
    const [workers, setWorkers] = useState(initialWorkers);
    const [issues, setIssues] = useState(initialIssues);
    const [dailyReports, setDailyReports] = useState(initialReports);
    const [safetyObservations, setSafetyObservations] = useState(initialSafety);
    const [stopHoldNotices, setStopHoldNotices] = useState(initialNotices);

    // Projects CRUD
    const addProject = (project) => setProjects([...projects, { ...project, id: `PROJ-${Date.now()}` }]);
    const updateProject = (id, updated) => setProjects(projects.map(p => p.id === id ? { ...p, ...updated } : p));
    const deleteProject = (id) => setProjects(projects.filter(p => p.id !== id));

    // Tasks CRUD
    const addTask = (task) => setTasks([...tasks, { ...task, id: `TASK-${Date.now()}` }]);
    const updateTask = (id, updated) => setTasks(tasks.map(t => t.id === id ? { ...t, ...updated } : t));
    const deleteTask = (id) => setTasks(tasks.filter(t => t.id !== id));

    // Workers CRUD
    const addWorker = (worker) => setWorkers([...workers, { ...worker, id: `WRK-${Date.now()}` }]);
    const updateWorker = (id, updated) => setWorkers(workers.map(w => w.id === id ? { ...w, ...updated } : w));
    const deleteWorker = (id) => setWorkers(workers.filter(w => w.id !== id));

    // Issues CRUD
    const addIssue = (issue) => setIssues([...issues, { ...issue, id: `ISS-${Date.now()}` }]);
    const updateIssue = (id, updated) => setIssues(issues.map(i => i.id === id ? { ...i, ...updated } : i));
    const deleteIssue = (id) => setIssues(issues.filter(i => i.id !== id));

    // Daily Reports CRUD
    const addDailyReport = (report) => setDailyReports([...dailyReports, { ...report, id: `REP-${Date.now()}` }]);
    const updateDailyReport = (id, updated) => setDailyReports(dailyReports.map(r => r.id === id ? { ...r, ...updated } : r));
    const deleteDailyReport = (id) => setDailyReports(dailyReports.filter(r => r.id !== id));

    // Safety Observations CRUD
    const addSafetyObservation = (obs) => setSafetyObservations([...safetyObservations, { ...obs, id: `SAF-${Date.now()}` }]);
    const updateSafetyObservation = (id, updated) => setSafetyObservations(safetyObservations.map(s => s.id === id ? { ...s, ...updated } : s));
    const deleteSafetyObservation = (id) => setSafetyObservations(safetyObservations.filter(s => s.id !== id));

    // Stop and Hold Notices CRUD
    const addStopHoldNotice = (notice) => setStopHoldNotices([...stopHoldNotices, { ...notice, id: `SHN-${Date.now()}` }]);
    const updateStopHoldNotice = (id, updated) => setStopHoldNotices(stopHoldNotices.map(n => n.id === id ? { ...n, ...updated } : n));
    const deleteStopHoldNotice = (id) => setStopHoldNotices(stopHoldNotices.filter(n => n.id !== id));

    return (
        <PMContext.Provider value={{
            projects, addProject, updateProject, deleteProject,
            tasks, addTask, updateTask, deleteTask,
            workers, addWorker, updateWorker, deleteWorker,
            issues, addIssue, updateIssue, deleteIssue,
            dailyReports, addDailyReport, updateDailyReport, deleteDailyReport,
            safetyObservations, addSafetyObservation, updateSafetyObservation, deleteSafetyObservation,
            stopHoldNotices, addStopHoldNotice, updateStopHoldNotice, deleteStopHoldNotice
        }}>
            {children}
        </PMContext.Provider>
    );
};
