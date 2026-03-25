import { createContext, useEffect, useState, useContext, useCallback } from "react";
import useAxios from "../hooks/useAxios";

export const SEContext = createContext();

export const SEProvider = (props) => {
    const axiosClient = useAxios();
    const [projects, setProjects] = useState([]);
    const [assignedTasks, setAssignedTasks] = useState([]);
    const [subtaskApprovals, setSubtaskApprovals] = useState([]);
    const [materialRequests, setMaterialRequests] = useState([]);
    const [dashboardMetrics, setDashboardMetrics] = useState(null);
    const [dailyReports, setDailyReports] = useState([]);
    const [ptws, setPtws] = useState([]);

    const fetchProjects = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/se/my-projects");
            if (data.success) {
                setProjects(data.projects.map(p => ({
                    ...p, id: p._id,
                    startDate: p.startDate?.split('T')[0] || '',
                    endDate: p.endDate?.split('T')[0] || '',
                })));
            }
        } catch (error) { console.error("Error fetching SE projects:", error); }
    }, [axiosClient]);

    const fetchDashboardMetrics = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/se/metrics");
            if (data.success) setDashboardMetrics(data.metrics);
        } catch (error) { console.error("Error fetching metrics:", error); }
    }, [axiosClient]);

    const fetchAssignedTasks = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/se/assigned-tasks");
            if (data.success) {
                setAssignedTasks(data.tasks.map(t => ({
                    ...t, id: t._id,
                    projectId: t.projectId?._id || t.projectId,
                    projectName: t.projectId?.name || '',
                })));
            }
        } catch (error) { console.error("Error fetching tasks:", error); }
    }, [axiosClient]);

    const fetchSubtaskApprovals = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/se/subtask-approvals");
            if (data.success) {
                setSubtaskApprovals(data.subtasks.map(t => ({
                    ...t, id: t._id,
                })));
            }
        } catch (error) { console.error("Error fetching subtask approvals:", error); }
    }, [axiosClient]);

    const fetchMaterialRequests = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/se/material-requests");
            if (data.success) {
                setMaterialRequests(data.requests.map(r => ({
                    ...r, id: r._id,
                    projectId: r.projectId?._id || r.projectId,
                    projectName: r.projectId?.name || '',
                })));
            }
        } catch (error) { console.error("Error fetching material requests:", error); }
    }, [axiosClient]);

    const fetchDailyReports = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/pm/reports");
            if (data.success) {
                setDailyReports(data.reports.map(r => ({
                    ...r, id: r._id,
                    projectId: r.projectId?._id || r.projectId,
                    projectName: r.projectId?.name || '',
                    date: r.reportDate?.split('T')[0] || '',
                    submittedBy: typeof r.reportedBy === 'object' ? r.reportedBy?.name : (r.reportedBy || 'Unknown'),
                    workCompleted: r.workCompleted || r.summary || '',
                    weather: r.weatherNotes || '',
                    notes: r.plannedNextSteps || '',
                    delaysOrRisks: r.delaysOrRisks || '',
                })));
            }
        } catch (error) { console.error("Error fetching reports:", error); }
    }, [axiosClient]);

    const addDailyReport = async (report) => {
        try {
            const projectId = report.projectId;
            if (!projectId) { alert('Please select a project.'); return; }

            const payload = {
                reportDate: report.date,
                summary: report.summary || '',
                workCompleted: report.workCompleted || '',
                plannedNextSteps: report.notes || '',
                delaysOrRisks: report.delaysOrRisks || '',
                weatherNotes: report.weather || '',
            };
            const { data } = await axiosClient.post(`/projects/${projectId}/site-progress-reports`, payload);
            if (data.success) await fetchDailyReports();
        } catch (e) {
            const msg = e.response?.data?.message || e.message;
            console.error("Error creating report:", msg);
            alert('Failed to create report: ' + msg);
        }
    };

    const createSubtask = async (projectId, parentTaskId, payload) => {
        try {
            const { data } = await axiosClient.post(`/se/projects/${projectId}/tasks/${parentTaskId}/subtasks`, {
                ...payload
            });
            if (data.success) await fetchAssignedTasks();
            return data;
        } catch (error) {
            console.error("Error creating subtask", error);
            const msg = error.response?.data?.message || error.response?.data?.invalidWorkers || error.message;
            alert('Failed to create subtask: ' + JSON.stringify(msg));
            throw error;
        }
    };

    const approveSubtask = async (projectId, taskId, note) => {
        try {
            const { data } = await axiosClient.patch(`/se/projects/${projectId}/subtasks/${taskId}/approve-completion`, { note });
            if (data.success) await fetchSubtaskApprovals();
            return data;
        } catch (error) {
            console.error("Error approving subtask", error);
            const msg = error.response?.data?.message || error.message;
            alert('Failed to approve subtask: ' + msg);
            throw error;
        }
    };

    const requestMainTaskCompletion = async (projectId, taskId, note) => {
        try {
            const { data } = await axiosClient.put(`/projects/${projectId}/tasks/${taskId}`, {
                status: 'Completed',
                percentComplete: 100
            });
            if (data.success) await fetchAssignedTasks();
            return data;
        } catch (error) {
            console.error("Error completing task", error);
            const msg = error.response?.data?.message || error.message;
            alert('Failed to complete task: ' + msg);
            throw error;
        }
    };

    const fetchPTWs = useCallback(async () => {
        // Can't easily use /projects/:projectId without project context here natively,
        // but since SE loads active project in component, let's expose fetch logic.
    }, []);

    const fetchPTWsByProject = async (projectId) => {
        try {
            const { data } = await axiosClient.get(`/projects/${projectId}/ptws`);
            if (data.success) setPtws(data.ptws.map(p => ({ ...p, id: p._id })));
        } catch (error) { console.error("Error fetching PTWs:", error); }
    };

    const createPTW = async (projectId, payload) => {
        try {
            const { data } = await axiosClient.post(`/projects/${projectId}/ptws`, payload);
            if (data.success) {
                await fetchPTWsByProject(projectId);
                await fetchAssignedTasks();
            }
            return data;
        } catch (error) {
            console.error("Error creating PTW", error);
            const msg = error.response?.data?.message || error.message;
            alert('Failed to request PTW: ' + msg);
            throw error;
        }
    };

    useEffect(() => {
        fetchProjects();
        fetchDashboardMetrics();
        fetchAssignedTasks();
        fetchSubtaskApprovals();
        fetchMaterialRequests();
        fetchDailyReports();
    }, [fetchProjects, fetchDashboardMetrics, fetchAssignedTasks, fetchSubtaskApprovals, fetchMaterialRequests, fetchDailyReports]);

    const value = {
        projects, assignedTasks, subtaskApprovals, materialRequests, dashboardMetrics, dailyReports, ptws,
        fetchProjects, fetchDashboardMetrics, fetchAssignedTasks, fetchSubtaskApprovals, fetchMaterialRequests, fetchDailyReports, fetchPTWsByProject,
        createSubtask, approveSubtask, requestMainTaskCompletion, addDailyReport, createPTW
    };

    return (
        <SEContext.Provider value={value}>
            {props.children}
        </SEContext.Provider>
    );
};

export const useSEContext = () => useContext(SEContext);
