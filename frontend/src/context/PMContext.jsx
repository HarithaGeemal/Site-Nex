import { createContext, useEffect, useState, useContext } from "react";
import {
    projects as dummyProjects,
    tasks as dummyTasks,
    workers as dummyWorkers,
    issues as dummyIssues,
    dailyReports as dummyReports,
    safetyObservations as dummySafety,
    stopHoldNotices as dummyNotices
} from "../assets/dummyData";

export const PMContext = createContext();

export const PMProvider = (props) => {

    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [issues, setIssues] = useState([]);
    const [dailyReports, setDailyReports] = useState([]);
    const [safetyObservations, setSafetyObservations] = useState([]);
    const [stopHoldNotices, setStopHoldNotices] = useState([]);

    // --- Fetch Functions (Dummy Data Simulated) ---

    const fetchProjects = () => {
        setProjects(dummyProjects);
    };

    const fetchTasks = () => {
        setTasks(dummyTasks);
    };

    const fetchWorkers = () => {
        setWorkers(dummyWorkers);
    };

    const fetchIssues = () => {
        setIssues(dummyIssues);
    };

    const fetchDailyReports = () => {
        setDailyReports(dummyReports);
    };

    const fetchSafetyObservations = () => {
        setSafetyObservations(dummySafety);
    };

    const fetchStopHoldNotices = () => {
        setStopHoldNotices(dummyNotices);
    };

    // --- Shared Helpers for CRUD ---

    const upsertById = (collection, item, prefix) => {
        if (item.id) {
            return collection.map(colItem => colItem.id === item.id ? { ...colItem, ...item } : colItem);
        }
        return [...collection, { ...item, id: `${prefix}-${Date.now()}` }];
    };

    const removeById = (collection, id) => {
        return collection.filter(item => item.id !== id);
    };

    // --- CRUD Functions ---

    // Projects
    const addProject = (project) => setProjects(prev => upsertById(prev, project, 'PROJ'));
    const updateProject = (id, updated) => setProjects(prev => upsertById(prev, { ...updated, id }, 'PROJ'));
    const deleteProject = (id) => setProjects(prev => removeById(prev, id));

    // Tasks
    const addTask = (task) => setTasks(prev => upsertById(prev, task, 'TASK'));
    const updateTask = (id, updated) => setTasks(prev => upsertById(prev, { ...updated, id }, 'TASK'));
    const deleteTask = (id) => setTasks(prev => removeById(prev, id));

    // Workers
    const addWorker = (worker) => setWorkers(prev => upsertById(prev, worker, 'WRK'));
    const updateWorker = (id, updated) => setWorkers(prev => upsertById(prev, { ...updated, id }, 'WRK'));
    const deleteWorker = (id) => setWorkers(prev => removeById(prev, id));

    // Issues
    const addIssue = (issue) => setIssues(prev => upsertById(prev, issue, 'ISS'));
    const updateIssue = (id, updated) => setIssues(prev => upsertById(prev, { ...updated, id }, 'ISS'));
    const deleteIssue = (id) => setIssues(prev => removeById(prev, id));

    // Daily Reports
    const addDailyReport = (report) => setDailyReports(prev => upsertById(prev, report, 'REP'));
    const updateDailyReport = (id, updated) => setDailyReports(prev => upsertById(prev, { ...updated, id }, 'REP'));
    const deleteDailyReport = (id) => setDailyReports(prev => removeById(prev, id));

    // Safety Observations
    const addSafetyObservation = (obs) => setSafetyObservations(prev => upsertById(prev, obs, 'SAF'));
    const updateSafetyObservation = (id, updated) => setSafetyObservations(prev => upsertById(prev, { ...updated, id }, 'SAF'));
    const deleteSafetyObservation = (id) => setSafetyObservations(prev => removeById(prev, id));

    // Stop and Hold Notices
    const addStopHoldNotice = (notice) => setStopHoldNotices(prev => upsertById(prev, notice, 'SHN'));
    const updateStopHoldNotice = (id, updated) => setStopHoldNotices(prev => upsertById(prev, { ...updated, id }, 'SHN'));
    const deleteStopHoldNotice = (id) => setStopHoldNotices(prev => removeById(prev, id));


    // --- Computed Helper Functions ---

    const getProjectTasks = (projectId) => {
        return tasks.filter(task => task.projectId === projectId);
    };

    const getProjectIssues = (projectId) => {
        return issues.filter(issue => issue.projectId === projectId);
    };

    const calculateProjectProgress = (projectId) => {
        const projectTasks = getProjectTasks(projectId);
        if (projectTasks.length === 0) return 0;
        const completedTasks = projectTasks.filter(task => task.status === "Completed").length;
        return Math.round((completedTasks / projectTasks.length) * 100);
    };

    const countOpenIssues = (projectId) => {
        return getProjectIssues(projectId).filter(issue => issue.status === "Open" || issue.status === "In Progress").length;
    };

    const getWorkerTaskLoad = (workerId) => {
        return tasks.filter(task => task.assignedTo && task.assignedTo.includes(workerId) && task.status !== "Completed").length;
    };

    const getOverdueTasks = (referenceDate) => {
        const refDateObj = new Date(referenceDate);
        return tasks.filter(task => {
            if (task.status === "Completed") return false;
            const dueDate = new Date(task.endDate);
            return dueDate < refDateObj;
        });
    };

    // --- useEffects ---

    useEffect(() => {
        fetchProjects();
        fetchTasks();
        fetchWorkers();
        fetchIssues();
        fetchDailyReports();
        fetchSafetyObservations();
        fetchStopHoldNotices();
    }, []);

    // --- Context Value ---

    const value = {
        projects, tasks, workers, issues, dailyReports, safetyObservations, stopHoldNotices,
        fetchProjects, fetchTasks, fetchWorkers, fetchIssues, fetchDailyReports, fetchSafetyObservations, fetchStopHoldNotices,
        addProject, updateProject, deleteProject,
        addTask, updateTask, deleteTask,
        addWorker, updateWorker, deleteWorker,
        addIssue, updateIssue, deleteIssue,
        addDailyReport, updateDailyReport, deleteDailyReport,
        addSafetyObservation, updateSafetyObservation, deleteSafetyObservation,
        addStopHoldNotice, updateStopHoldNotice, deleteStopHoldNotice,
        getProjectTasks, getProjectIssues, calculateProjectProgress, countOpenIssues, getWorkerTaskLoad, getOverdueTasks
    };

    return (
        <PMContext.Provider value={value}>
            {props.children}
        </PMContext.Provider>
    );
};

export const usePMContext = () => useContext(PMContext);
