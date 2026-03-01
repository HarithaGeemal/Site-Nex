import React, { useState } from 'react';
import { usePMContext } from '../../context/PMContext';

const DailyReports = () => {
    const { dailyReports, addDailyReport, updateDailyReport, deleteDailyReport, projects } = usePMContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentReport, setCurrentReport] = useState(null);

    // form state
    const [formData, setFormData] = useState({
        projectId: '', date: '', submittedBy: '', weather: '', workCompleted: '', materialsUsed: '', equipmentOnSite: '', workerCount: 0, notes: ''
    });

    const openModal = (report = null) => {
        if (report) {
            setCurrentReport(report);
            setFormData({
                ...report,
                equipmentOnSite: report.equipmentOnSite ? report.equipmentOnSite.join(', ') : ''
            });
        } else {
            setCurrentReport(null);
            setFormData({ projectId: projects[0]?.id || '', date: new Date().toISOString().split('T')[0], submittedBy: '', weather: '', workCompleted: '', materialsUsed: '', equipmentOnSite: '', workerCount: 0, notes: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentReport(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Parse equipment string into array
        const processedData = {
            ...formData,
            equipmentOnSite: formData.equipmentOnSite.split(',').map(item => item.trim()).filter(Boolean)
        };

        if (currentReport) {
            updateDailyReport(currentReport.id, processedData);
        } else {
            addDailyReport(processedData);
        }
        closeModal();
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this report?")) {
            deleteDailyReport(id);
        }
    };

    // Helper to get project name
    const getProjectName = (id) => projects.find(p => p.id === id)?.name || 'Unknown Project';

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-navy-dark">Daily Log & Reports</h1>
                <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
                    + Add Daily Report
                </button>
            </div>

            {/* Grid of Reports */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dailyReports.map(report => (
                    <div key={report.id} className="bg-white rounded-lg shadow p-5 border border-gray-200 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-lg font-semibold text-gray-800">Report: {report.date}</h2>
                        </div>
                        <p className="text-xs text-blue-600 font-medium mb-3">{getProjectName(report.projectId)}</p>

                        <div className="space-y-3 text-sm text-gray-700 flex-1">
                            <div>
                                <span className="font-medium text-gray-500 block mb-1">Weather:</span>
                                <span className="bg-gray-100 px-2 py-1 rounded text-xs">{report.weather}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-500 block mb-1">Work Completed:</span>
                                <p className="text-xs">{report.workCompleted}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-500 block mb-1">Equipment On Site:</span>
                                <p className="text-xs">{report.equipmentOnSite?.join(', ') || 'None'}</p>
                            </div>
                            <div className="flex justify-between mt-2 pt-2 border-t">
                                <span className="font-medium text-gray-500">Worker Count:</span>
                                <span>{report.workerCount}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium text-gray-500">Submitted By:</span>
                                <span>{report.submittedBy}</span>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end space-x-3 pt-4">
                            <button onClick={() => openModal(report)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                            <button onClick={() => handleDelete(report.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">{currentReport ? 'Edit Daily Report' : 'Add New Daily Report'}</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                                    <select name="projectId" value={formData.projectId} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2">
                                        <option value="">Select Project</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Submitted By</label>
                                    <input type="text" name="submittedBy" value={formData.submittedBy} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Weather Condition</label>
                                    <input type="text" name="weather" placeholder="e.g. Clear, 75°F" value={formData.weather} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Worker Count</label>
                                    <input type="number" name="workerCount" value={formData.workerCount} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Work Completed</label>
                                <textarea name="workCompleted" value={formData.workCompleted} onChange={handleChange} rows="2" required className="w-full border border-gray-300 rounded px-3 py-2"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Materials Used</label>
                                <textarea name="materialsUsed" value={formData.materialsUsed} onChange={handleChange} rows="2" className="w-full border border-gray-300 rounded px-3 py-2"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment On Site (comma separated)</label>
                                <textarea name="equipmentOnSite" placeholder="Excavator (1), Concrete Mixer (2)" value={formData.equipmentOnSite} onChange={handleChange} rows="2" className="w-full border border-gray-300 rounded px-3 py-2"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" className="w-full border border-gray-300 rounded px-3 py-2"></textarea>
                            </div>
                        </form>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
                            <button type="button" onClick={closeModal} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
                            <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">Save Report</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyReports;
