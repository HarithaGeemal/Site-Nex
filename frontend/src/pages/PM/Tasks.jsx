import React, { useState } from 'react';
import { usePMContext } from '../../context/PMContext';

const Tasks = () => {
    const { tasks, addTask, updateTask, deleteTask, projects, workers } = usePMContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);

    // form state
    const [formData, setFormData] = useState({
        projectId: '', name: '', description: '', assignedTo: [], startDate: '', endDate: '', status: 'To Do', priority: 'Medium'
    });

    const openModal = (task = null) => {
        if (task) {
            setCurrentTask(task);
            setFormData({
                ...task,
                assignedTo: task.assignedTo || []
            });
        } else {
            setCurrentTask(null);
            setFormData({ projectId: projects[0]?.id || '', name: '', description: '', assignedTo: [], startDate: '', endDate: '', status: 'To Do', priority: 'Medium' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentTask(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (e) => {
        const value = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, assignedTo: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentTask) {
            updateTask(currentTask.id, formData);
        } else {
            addTask(formData);
        }
        closeModal();
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            deleteTask(id);
        }
    };

    // Helper to get project name
    const getProjectName = (id) => projects.find(p => p.id === id)?.name || 'Unknown Project';

    // Helper to get workers names
    const getWorkerNames = (ids) => {
        if (!ids || ids.length === 0) return 'Unassigned';
        return ids.map(id => workers.find(w => w.id === id)?.name || id).join(', ');
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-navy-dark">Task Management</h1>
                <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
                    + Add New Task
                </button>
            </div>

            {/* Grid of Tasks */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map(task => (
                    <div key={task.id} className="bg-white rounded-lg shadow p-5 border border-gray-200 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-lg font-semibold text-gray-800">{task.name}</h2>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : task.status === 'Completed' ? 'bg-green-100 text-green-800' : task.status === 'Blocked' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                {task.status}
                            </span>
                        </div>
                        <p className="text-xs text-blue-600 font-medium mb-3">{getProjectName(task.projectId)}</p>
                        <p className="text-sm text-gray-600 flex-1 mb-4">{task.description}</p>

                        <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-500">Timeline:</span>
                                <span>{task.startDate} to {task.endDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-500">Priority:</span>
                                <span className={`font-semibold ${task.priority === 'Critical' ? 'text-red-600' : task.priority === 'High' ? 'text-orange-500' : 'text-gray-700'}`}>{task.priority}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-500 block mb-1">Assignees:</span>
                                <div className="text-xs bg-gray-50 p-2 rounded">
                                    {getWorkerNames(task.assignedTo)}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
                            <button onClick={() => openModal(task)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                            <button onClick={() => handleDelete(task.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">{currentTask ? 'Edit Task' : 'Add New Task'}</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                                    <select name="projectId" value={formData.projectId} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2">
                                        <option value="">Select Project</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2">
                                        <option value="To Do">To Do</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Blocked">Blocked</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select name="priority" value={formData.priority} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2">
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="2" required className="w-full border border-gray-300 rounded px-3 py-2"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Workers (Hold Ctrl/Cmd to select multiple)</label>
                                <select name="assignedTo" multiple value={formData.assignedTo} onChange={handleMultiSelectChange} className="w-full border border-gray-300 rounded px-3 py-2 h-24">
                                    {workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.role})</option>)}
                                </select>
                            </div>
                        </form>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
                            <button type="button" onClick={closeModal} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
                            <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">Save Task</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;
