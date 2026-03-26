import { createContext, useEffect, useState, useContext, useCallback } from "react";
import useAxios from "../hooks/useAxios";

export const WorkerContext = createContext();

export const WorkerProvider = (props) => {
    const axiosClient = useAxios();

    const [stats, setStats] = useState({
        projectsCount: 0,
        tasksCount: 0,
        subtasksCount: 0
    });
    
    const [assignedTasks, setAssignedTasks] = useState([]);
    const [assignedSubtasks, setAssignedSubtasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDashboard = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data } = await axiosClient.get("/worker/dashboard");
            if (data.success) {
                setAssignedTasks(data.assignedTasks || []);
                setAssignedSubtasks(data.assignedSubtasks || []);
                
                setStats({
                    projectsCount: data.projectsCount || 0,
                    tasksCount: (data.assignedTasks || []).length,
                    subtasksCount: (data.assignedSubtasks || []).length
                });
            }
        } catch (error) {
            console.error("Error fetching worker dashboard:", error);
        } finally {
            setIsLoading(false);
        }
    }, [axiosClient]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const requestSubtaskCompletion = async (subtaskId) => {
        try {
            const { data } = await axiosClient.patch(`/worker/subtasks/${subtaskId}/request-completion`);
            if (data.success) {
                // Instantly re-fetch the dashboard to update task statuses
                fetchDashboard();
                return data;
            }
        } catch (error) {
            console.error("Error requesting subtask completion:", error);
            throw error;
        }
    };

    const value = {
        stats,
        assignedTasks,
        assignedSubtasks,
        isLoading,
        fetchDashboard,
        requestSubtaskCompletion
    };

    return (
        <WorkerContext.Provider value={value}>
            {props.children}
        </WorkerContext.Provider>
    );
};

export const useWorkerContext = () => useContext(WorkerContext);
