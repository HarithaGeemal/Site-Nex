import React, { useState } from 'react';
import { usePMContext } from '../../context/PMContext';

const Issues = () => {
    const { issues, addIssue, updateIssue, deleteIssue, projects } = usePMContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentIssue, setCurrentIssue] = useState(null);

    // form state
    const [formData, setFormData] = useState({
        projectId: '', title: '', description: '', reportedBy: '', reportedDate: '', status: 'Open', priority: 'Medium', attachments: []
    });

    const openModal = (issue = null) => {
        if (issue) {
            setCurrentIssue(issue);
            setFormData(issue);
        } else {
            setCurrentIssue(null);
            setFormData({ projectId: projects[0]?.id || '', title: '', description: '', reportedBy: '', reportedDate: new Date().toISOString().split('T')[0], status: 'Open', priority: 'Medium', attachments: [] });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentIssue(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentIssue) {
            updateIssue(currentIssue.id, formData);
        } else {
            addIssue(formData);
        }
        closeModal();
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this issue?")) {
            deleteIssue(id);
        }
    };

    // Helper to get project name
    const getProjectName = (id) => projects.find(p => p.id === id)?.name || 'Unknown Project';

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-navy-dark">Issues & Defect Tracking</h1>
                <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
                    + Report New Issue
                </button>
            </div>

            {/* Grid of Issues */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {issues.map(issue => (
                    <div key={issue.id} className="bg-white rounded-lg shadow p-5 border border-gray-200 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-lg font-semibold text-gray-800">{issue.title}</h2>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${issue.status === 'Resolved' ? 'bg-green-100 text-green-800' : issue.status === 'Closed' ? 'bg-gray-100 text-gray-800' : issue.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                                {issue.status}
                            </span>
                        </div>
                        <p className="text-xs text-blue-600 font-medium mb-3">{getProjectName(issue.projectId)}</p>
                        <p className="text-sm text-gray-600 flex-1 mb-4">{issue.description}</p>

                        <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-500">Reported By:</span>
                                <span>{issue.reportedBy}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-500">Date:</span>
                                <span>{issue.reportedDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-500">Priority:</span>
                                <span className={`font-semibold ${issue.priority === 'Critical' ? 'text-red-600' : issue.priority === 'High' ? 'text-orange-500' : 'text-gray-700'}`}>{issue.priority}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
                            <button onClick={() => openModal(issue)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                            <button onClick={() => handleDelete(issue.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">{currentIssue ? 'Edit Issue' : 'Report New Issue'}</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue Title</label>
                                    <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                                    <select name="projectId" value={formData.projectId} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2">
                                        <option value="">Select Project</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reported By</label>
                                    <input type="text" name="reportedBy" value={formData.reportedBy} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input type="date" name="reportedDate" value={formData.reportedDate} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2">
                                        <option value="Open">Open</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Resolved">Resolved</option>
                                        <option value="Closed">Closed</option>
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
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" required className="w-full border border-gray-300 rounded px-3 py-2"></textarea>
                            </div>
                        </form>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
                            <button type="button" onClick={closeModal} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
                            <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">Save Issue</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Issues;
