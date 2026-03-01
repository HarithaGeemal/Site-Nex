import React, { useState } from 'react';
import { usePMContext } from '../../context/PMContext';

const SafetyNotices = () => {
    const {
        safetyObservations, addSafetyObservation, updateSafetyObservation, deleteSafetyObservation,
        stopHoldNotices, addStopHoldNotice, updateStopHoldNotice, deleteStopHoldNotice,
        projects
    } = usePMContext();

    // Modal state for Safety Observations
    const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
    const [currentSafety, setCurrentSafety] = useState(null);
    const [safetyFormData, setSafetyFormData] = useState({
        projectId: '', date: '', observer: '', type: 'Hazard', description: '', actionTaken: '', status: 'Open', severity: 'Low'
    });

    // Modal state for Stop/Hold Notices
    const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
    const [currentNotice, setCurrentNotice] = useState(null);
    const [noticeFormData, setNoticeFormData] = useState({
        projectId: '', dateIssued: '', issuedBy: '', reason: '', affectedArea: '', status: 'Active', dateLifted: '', resolution: ''
    });

    const getProjectName = (id) => projects.find(p => p.id === id)?.name || 'Unknown Project';

    // ---- Safety Observations Handlers ----
    const openSafetyModal = (obs = null) => {
        if (obs) {
            setCurrentSafety(obs);
            setSafetyFormData(obs);
        } else {
            setCurrentSafety(null);
            setSafetyFormData({ projectId: projects[0]?.id || '', date: new Date().toISOString().split('T')[0], observer: '', type: 'Hazard', description: '', actionTaken: '', status: 'Open', severity: 'Low' });
        }
        setIsSafetyModalOpen(true);
    };

    const handleSafetyChange = (e) => setSafetyFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSafetySubmit = (e) => {
        e.preventDefault();
        if (currentSafety) {
            updateSafetyObservation(currentSafety.id, safetyFormData);
        } else {
            addSafetyObservation(safetyFormData);
        }
        setIsSafetyModalOpen(false);
    };

    const handleSafetyDelete = (id) => {
        if (window.confirm("Delete this safety observation?")) deleteSafetyObservation(id);
    };

    // ---- Stop/Hold Notices Handlers ----
    const openNoticeModal = (notice = null) => {
        if (notice) {
            setCurrentNotice(notice);
            setNoticeFormData(notice);
        } else {
            setCurrentNotice(null);
            setNoticeFormData({ projectId: projects[0]?.id || '', dateIssued: new Date().toISOString().split('T')[0], issuedBy: '', reason: '', affectedArea: '', status: 'Active', dateLifted: '', resolution: '' });
        }
        setIsNoticeModalOpen(true);
    };

    const handleNoticeChange = (e) => setNoticeFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleNoticeSubmit = (e) => {
        e.preventDefault();
        if (currentNotice) {
            updateStopHoldNotice(currentNotice.id, noticeFormData);
        } else {
            addStopHoldNotice(noticeFormData);
        }
        setIsNoticeModalOpen(false);
    };

    const handleNoticeDelete = (id) => {
        if (window.confirm("Delete this stop/hold notice?")) deleteStopHoldNotice(id);
    };

    return (
        <div className="p-6 space-y-10">
            {/* Safety Observations Section */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-navy-dark">Safety Observations</h1>
                    <button onClick={() => openSafetyModal()} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
                        + Add Observation
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {safetyObservations.map(obs => (
                        <div key={obs.id} className="bg-white rounded-lg shadow p-5 border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${obs.type === 'Hazard' ? 'bg-red-100 text-red-800' : obs.type === 'Best Practice' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {obs.type}
                                </span>
                                <span className="text-sm font-medium text-gray-500">{obs.date}</span>
                            </div>
                            <p className="text-xs text-blue-600 font-medium mb-3">{getProjectName(obs.projectId)}</p>
                            <p className="text-sm text-gray-800 mb-2">{obs.description}</p>
                            <p className="text-xs text-gray-600 italic">Action: {obs.actionTaken}</p>

                            <div className="mt-4 pt-3 border-t flex justify-between items-center text-sm">
                                <span className="text-gray-500">Observer: {obs.observer}</span>
                                <span className={`font-semibold ${obs.status === 'Resolved' || obs.status === 'Closed' ? 'text-green-600' : 'text-orange-500'}`}>{obs.status}</span>
                            </div>

                            <div className="mt-4 flex justify-end space-x-3">
                                <button onClick={() => openSafetyModal(obs)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                                <button onClick={() => handleSafetyDelete(obs.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stop / Hold Notices Section */}
            <div>
                <div className="flex justify-between items-center mb-6 border-t pt-10">
                    <h1 className="text-2xl font-bold text-navy-dark">Stop / Hold Notices</h1>
                    <button onClick={() => openNoticeModal()} className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 transition">
                        + Issue Notice
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stopHoldNotices.map(notice => (
                        <div key={notice.id} className="bg-white rounded-lg shadow-md p-5 border-l-4 border-red-500">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-800 text-lg">Area: {notice.affectedArea}</h3>
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${notice.status === 'Active' ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-green-100 text-green-800'}`}>
                                    {notice.status}
                                </span>
                            </div>
                            <p className="text-xs text-blue-600 font-medium mb-3">{getProjectName(notice.projectId)}</p>
                            <div className="text-sm text-gray-700 mb-4 bg-red-50 p-2 rounded border border-red-100">
                                <strong>Reason:</strong> {notice.reason}
                            </div>
                            {notice.resolution && (
                                <div className="text-xs text-gray-600 mb-3">
                                    <strong>Resolution:</strong> {notice.resolution}
                                </div>
                            )}
                            <div className="text-xs text-gray-500 space-y-1">
                                <p>Issued by: {notice.issuedBy} on {notice.dateIssued}</p>
                                {notice.dateLifted && <p>Lifted on: {notice.dateLifted}</p>}
                            </div>

                            <div className="mt-4 flex justify-end space-x-3 pt-3 border-t">
                                <button onClick={() => openNoticeModal(notice)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                                <button onClick={() => handleNoticeDelete(notice.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Safety Observation Modal */}
            {isSafetyModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">{currentSafety ? 'Edit Observation' : 'Add Observation'}</h3>
                            <button type="button" onClick={() => setIsSafetyModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSafetySubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                                    <select name="projectId" value={safetyFormData.projectId} onChange={handleSafetyChange} required className="w-full border border-gray-300 rounded px-3 py-2">
                                        <option value="">Select Project</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input type="date" name="date" value={safetyFormData.date} onChange={handleSafetyChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Observer</label>
                                    <input type="text" name="observer" value={safetyFormData.observer} onChange={handleSafetyChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select name="type" value={safetyFormData.type} onChange={handleSafetyChange} className="w-full border border-gray-300 rounded px-3 py-2">
                                        <option value="Hazard">Hazard</option>
                                        <option value="Best Practice">Best Practice</option>
                                        <option value="Near Miss">Near Miss</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select name="status" value={safetyFormData.status} onChange={handleSafetyChange} className="w-full border border-gray-300 rounded px-3 py-2">
                                        <option value="Open">Open</option>
                                        <option value="Resolved">Resolved</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                                    <select name="severity" value={safetyFormData.severity} onChange={handleSafetyChange} className="w-full border border-gray-300 rounded px-3 py-2">
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea name="description" value={safetyFormData.description} onChange={handleSafetyChange} rows="2" required className="w-full border border-gray-300 rounded px-3 py-2"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Action Taken</label>
                                <textarea name="actionTaken" value={safetyFormData.actionTaken} onChange={handleSafetyChange} rows="2" required className="w-full border border-gray-300 rounded px-3 py-2"></textarea>
                            </div>
                        </form>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
                            <button type="button" onClick={() => setIsSafetyModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
                            <button type="button" onClick={handleSafetySubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stop/Hold Notice Modal */}
            {isNoticeModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">{currentNotice ? 'Edit Notice' : 'Issue Notice'}</h3>
                            <button type="button" onClick={() => setIsNoticeModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleNoticeSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                                    <select name="projectId" value={noticeFormData.projectId} onChange={handleNoticeChange} required className="w-full border border-gray-300 rounded px-3 py-2">
                                        <option value="">Select Project</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Issued</label>
                                    <input type="date" name="dateIssued" value={noticeFormData.dateIssued} onChange={handleNoticeChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Issued By</label>
                                    <input type="text" name="issuedBy" value={noticeFormData.issuedBy} onChange={handleNoticeChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Affected Area</label>
                                    <input type="text" name="affectedArea" value={noticeFormData.affectedArea} onChange={handleNoticeChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select name="status" value={noticeFormData.status} onChange={handleNoticeChange} className="w-full border border-gray-300 rounded px-3 py-2">
                                        <option value="Active">Active</option>
                                        <option value="Lifted">Lifted</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Lifted (if applicable)</label>
                                    <input type="date" name="dateLifted" value={noticeFormData.dateLifted || ''} onChange={handleNoticeChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Stop/Hold</label>
                                <textarea name="reason" value={noticeFormData.reason} onChange={handleNoticeChange} rows="2" required className="w-full border border-gray-300 rounded px-3 py-2"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Details</label>
                                <textarea name="resolution" value={noticeFormData.resolution} onChange={handleNoticeChange} rows="2" className="w-full border border-gray-300 rounded px-3 py-2"></textarea>
                            </div>
                        </form>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
                            <button type="button" onClick={() => setIsNoticeModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
                            <button type="button" onClick={handleNoticeSubmit} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium">Save Notice</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SafetyNotices;
