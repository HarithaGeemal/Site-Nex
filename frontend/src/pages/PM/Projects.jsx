import React, { useState } from 'react';
import { usePMContext } from '../../context/PMContext';

const Projects = () => {
    const { projects, addProject, updateProject, deleteProject } = usePMContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState(null);

    // form state
    const [formData, setFormData] = useState({
        name: '', location: '', startDate: '', estimatedEndDate: '', budget: '', status: 'Planning', progress: 0, projectManager: '', siteEngineer: '', description: ''
    });

    const openModal = (project = null) => {
        if (project) {
            setCurrentProject(project);
            setFormData(project);
        } else {
            setCurrentProject(null);
            setFormData({ name: '', location: '', startDate: '', estimatedEndDate: '', budget: '', status: 'Planning', progress: 0, projectManager: '', siteEngineer: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentProject(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentProject) {
            updateProject(currentProject.id, formData);
        } else {
            addProject(formData);
        }
        closeModal();
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            deleteProject(id);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-navy-dark">Projects Management</h1>
                <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
                    + Add New Project
                </button>
            </div>

            {/* Grid of Projects */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <div key={project.id} className="bg-white rounded-lg shadow p-5 border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-xl font-semibold text-gray-800">{project.name}</h2>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : project.status === 'Planning' ? 'bg-yellow-100 text-yellow-800' : project.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {project.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">{project.location}</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="font-medium">Manager:</span>
                                <span>{project.projectManager}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Engineer:</span>
                                <span>{project.siteEngineer}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Budget:</span>
                                <span>${Number(project.budget).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                            <div className="flex justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>{project.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={() => openModal(project)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                            <button onClick={() => handleDelete(project.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold">{currentProject ? 'Edit Project' : 'Add New Project'}</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Est. End Date</label>
                                    <input type="date" name="estimatedEndDate" value={formData.estimatedEndDate} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                                    <input type="number" name="budget" value={formData.budget} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2">
                                        <option value="Planning">Planning</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="On Hold">On Hold</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                                    <input type="number" name="progress" min="0" max="100" value={formData.progress} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager</label>
                                    <input type="text" name="projectManager" value={formData.projectManager} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Engineer</label>
                                    <input type="text" name="siteEngineer" value={formData.siteEngineer} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" required className="w-full border border-gray-300 rounded px-3 py-2"></textarea>
                            </div>
                        </form>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
                            <button type="button" onClick={closeModal} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
                            <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">Save Project</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
