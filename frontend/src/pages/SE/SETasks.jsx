import React, { useState } from 'react';
import { useSEContext } from '../../context/SEContext';

const priorityColors = {
    Critical: 'bg-red-100 text-red-800 border-red-300',
    High: 'bg-orange-100 text-orange-800 border-orange-300',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Low: 'bg-green-100 text-green-800 border-green-300',
};

const statusColors = {
    'In Progress': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
    'Blocked': 'bg-red-100 text-red-800',
    'Not Started': 'bg-gray-100 text-gray-700',
    'Under Review': 'bg-purple-100 text-purple-800',
};

const SETasks = () => {
    const { assignedTasks, createSubtask, requestMainTaskCompletion } = useSEContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeParentTask, setActiveParentTask] = useState(null);

    const [formData, setFormData] = useState({
        name: '', description: '', assignedWorkers: [],
        startDate: '', endDate: '', status: 'Not Started', priority: 'Medium'
    });

    // Grouping
    const mainTasks = assignedTasks.filter(t => !t.parentTaskId);
    const getSubtasks = (parentId) => assignedTasks.filter(t => (t.parentTaskId?._id || t.parentTaskId) === parentId);

    const openSubtaskModal = (parent) => {
        setActiveParentTask(parent);
        setFormData({
            name: '', description: '', assignedWorkers: [],
            startDate: parent.startDate ? new Date(parent.startDate).toISOString().split('T')[0] : '', 
            endDate: parent.endDate ? new Date(parent.endDate).toISOString().split('T')[0] : '', 
            status: 'Not Started', priority: 'Medium'
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setActiveParentTask(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (e) => {
        const value = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, assignedWorkers: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createSubtask(activeParentTask.projectId, activeParentTask.id, formData);
            closeModal();
            alert("Subtask successfully delegated.");
        } catch (error) {
            // Error is handled in context
            console.error("Delegation failed");
        }
    };

    const handleCompleteMain = async (task) => {
        if (window.confirm("Are you sure you want to mark this task as completed?")) {
            try {
                await requestMainTaskCompletion(task.projectId, task.id);
                alert("Task marked as completed successfully.");
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Assigned Tasks</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your delegated Main Tasks and branch out Subtasks to your workers.</p>
                </div>
            </div>

            <div className="space-y-6">
                {mainTasks.map(mainTask => {
                    const subtasks = getSubtasks(mainTask.id);
                    return (
                        <div key={mainTask.id} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                            {/* Main Task Header */}
                            <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-gray-800">{mainTask.name}</h3>
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[mainTask.status] || 'bg-gray-100 text-gray-700'}`}>{mainTask.status}</span>
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded border ${priorityColors[mainTask.priority] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>{mainTask.priority}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{mainTask.description}</p>
                                    
                                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                                        <div><span className="font-semibold text-gray-700">Project:</span> {mainTask.projectName}</div>
                                        <div><span className="font-semibold text-gray-700">Timeline:</span> {new Date(mainTask.startDate).toLocaleDateString()} → {new Date(mainTask.endDate).toLocaleDateString()}</div>
                                        <div><span className="font-semibold text-gray-700">Your Base Workers:</span> {mainTask.assignedWorkers?.map(w => w.name).join(', ') || 'None Assigned'}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {!mainTask.completionRequested && mainTask.status !== "Completed" && (
                                        <button onClick={() => handleCompleteMain(mainTask)} className="bg-emerald-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-emerald-700 shadow-sm">
                                            Mark as Completed
                                        </button>
                                    )}
                                    {mainTask.completionRequested && mainTask.status !== "Completed" && (
                                        <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded text-sm font-medium border border-yellow-200">
                                            Awaiting PM Approval
                                        </span>
                                    )}
                                    {mainTask.status !== "Completed" && !mainTask.completionRequested && (
                                        <button onClick={() => openSubtaskModal(mainTask)} className="bg-steel-blue text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-steel-blue/90 shadow-sm">
                                            + Delegate Subtask
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Subtasks Section */}
                            {subtasks.length > 0 ? (
                                <div className="p-4 bg-white">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">Subtasks Pipeline</h4>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                        {subtasks.map(sub => (
                                            <div key={sub.id} className="border border-gray-200 rounded p-3 bg-gray-50 hover:bg-white transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h5 className="font-semibold text-gray-800 text-sm">{sub.name}</h5>
                                                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${statusColors[sub.status] || 'bg-gray-100 text-gray-700'}`}>{sub.status}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200">
                                                    <span className="truncate max-w-[200px]">Workers: {sub.assignedWorkers?.map(w => w.name).join(', ') || 'Unassigned'}</span>
                                                    {sub.completionRequested && !sub.completionApprovedAt && (
                                                        <span className="text-orange-600 font-medium whitespace-nowrap">Needs Your Approval</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-white text-sm text-gray-400 italic ml-2">No subtasks delegated yet.</div>
                            )}
                        </div>
                    );
                })}

                {mainTasks.length === 0 && (
                    <div className="text-center py-16 text-gray-500 bg-white rounded-xl shadow border border-gray-200">
                        <p className="text-lg font-medium">No main tasks have been assigned to you yet.</p>
                    </div>
                )}
            </div>

            {/* Subtask Modal */}
            {isModalOpen && activeParentTask && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">Delegate Subtask</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="bg-blue-50 text-blue-800 p-3 rounded text-sm mb-2 border border-blue-100">
                                <span className="font-semibold">Parent Task:</span> {activeParentTask.name}
                            </div>
                            
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Subtask Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                            </div>
                            
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="2" required className="w-full border border-gray-300 rounded px-3 py-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Workers (Hold Ctrl/Cmd to select multiple)</label>
                                <select 
                                    name="assignedWorkers" multiple value={formData.assignedWorkers} onChange={handleMultiSelectChange} 
                                    className="w-full border border-gray-300 rounded px-3 py-2 h-24"
                                    required
                                >
                                    {activeParentTask.assignedWorkers?.map(w => (
                                        <option key={w._id} value={w._id}>{w.name} — {w.trade}</option>
                                    ))}
                                    {(!activeParentTask.assignedWorkers || activeParentTask.assignedWorkers.length === 0) && (
                                        <option value="" disabled>No workers available on the parent task</option>
                                    )}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">You can only assign workers that have been natively allocated to the parent task.</p>
                            </div>
                            
                        </form>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
                            <button type="button" onClick={closeModal} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
                            <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-steel-blue text-white rounded hover:bg-steel-blue/90 font-medium">Deploy Subtask</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SETasks;
