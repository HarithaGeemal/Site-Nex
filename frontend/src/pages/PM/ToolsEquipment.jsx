import React, { useState, useEffect, useCallback } from 'react';
import { usePMContext } from '../../context/PMContext';
import useAxios from '../../hooks/useAxios';

const ToolsEquipment = () => {
    const { projects, tasks } = usePMContext();
    const axiosClient = useAxios();
    
    const [selectedProject, setSelectedProject] = useState('');
    const [tools, setTools] = useState([]);
    const [checkouts, setCheckouts] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modals
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [currentTool, setCurrentTool] = useState(null);
    const [currentCheckout, setCurrentCheckout] = useState(null);
    
    const [checkoutFormData, setCheckoutFormData] = useState({ taskId: '', issuedTo: '', expectedReturnDate: '', notes: '' });
    const [returnFormData, setReturnFormData] = useState({ returnCondition: 'Good', notes: '' });

    const fetchProjectData = useCallback(async (projectId) => {
        if (!projectId) {
            setTools([]);
            setCheckouts([]);
            setMembers([]);
            return;
        }
        setLoading(true);
        try {
            const [toolRes, checkoutRes, projRes] = await Promise.all([
                axiosClient.get(`/projects/${projectId}/tools`),
                axiosClient.get(`/projects/${projectId}/checkouts`),
                axiosClient.get(`/projects/${projectId}`)
            ]);
            
            if (toolRes.data.success) setTools(toolRes.data.tools);
            if (checkoutRes.data.success) setCheckouts(checkoutRes.data.checkouts);
            if (projRes.data.success && projRes.data.project.members) {
                // Member populated user object is inside m.userId
                setMembers(projRes.data.project.members.map(m => m.userId).filter(Boolean));
            }
        } catch (error) {
            console.error("Error fetching project tools/checkouts:", error);
        } finally {
            setLoading(false);
        }
    }, [axiosClient]);

    useEffect(() => {
        if (projects.length > 0 && !selectedProject) {
            setSelectedProject(projects[0].id);
        }
    }, [projects, selectedProject]);

    useEffect(() => {
        if (selectedProject) fetchProjectData(selectedProject);
    }, [selectedProject, fetchProjectData]);

    // Helpers
    const getTaskName = (id) => tasks.find(t => t.id === id || t._id === id)?.name || 'N/A';
    const getMemberName = (id) => members.find(m => m._id === id || m.id === id)?.name || 'Unknown User';

    // Checkout Logic
    const openCheckoutModal = (tool) => {
        if (tool.availableQuantity < 1) return alert('Tool out of stock.');
        if (tool.isBlacklisted) return alert('This tool is blacklisted by Safety. Cannot check out.');
        setCurrentTool(tool);
        setCheckoutFormData({ taskId: '', issuedTo: '', expectedReturnDate: new Date().toISOString().split('T')[0], notes: '' });
        setIsCheckoutModalOpen(true);
    };

    const handleCheckoutSubmit = async (e) => {
        e.preventDefault();
        
        // Validation: Expected Return Date >= today
        if (checkoutFormData.expectedReturnDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const returnDate = new Date(checkoutFormData.expectedReturnDate);
            if (returnDate < today) {
                return alert('Validation Error: Expected Return Date cannot be in the past.');
            }
        }

        try {
            const payload = { ...checkoutFormData, toolId: currentTool._id };
            if (!payload.taskId) delete payload.taskId; // optional
            
            const { data } = await axiosClient.post(`/projects/${selectedProject}/checkouts`, payload);
            if (data.success) {
                setIsCheckoutModalOpen(false);
                fetchProjectData(selectedProject); // Refresh lists
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            alert(`Checkout Blocked:\\n${msg}`);
        }
    };

    // Return Logic
    const openReturnModal = (checkout) => {
        setCurrentCheckout(checkout);
        // Default to the condition it was before checkout
        setReturnFormData({ returnCondition: checkout.toolId?.condition || 'Good', notes: '' });
        setIsReturnModalOpen(true);
    };

    const handleReturnSubmit = async (e) => {
        e.preventDefault();

        // Validation: If returned Damaged/Poor, require notes
        if (['Damaged', 'Poor'].includes(returnFormData.returnCondition) && !returnFormData.notes.trim()) {
            return alert('Validation Error: Please provide explanatory notes when returning a tool in Poor or Damaged condition.');
        }

        try {
            const { data } = await axiosClient.put(`/projects/${selectedProject}/checkouts/${currentCheckout._id}/return`, returnFormData);
            if (data.success) {
                setIsReturnModalOpen(false);
                fetchProjectData(selectedProject); // Refresh lists
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            alert(`Return Failed:\\n${msg}`);
        }
    };

    return (
        <div className="p-6 bg-concrete-light min-h-full">
            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-steel-blue">Tools & Equipment Management</h1>
                    <p className="text-sm text-concrete mt-1">Manage project inventory, checkouts, and returns.</p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Project:</label>
                    <select 
                        value={selectedProject} 
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-steel-blue"
                    >
                        <option value="" disabled>Select a Project</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-steel-blue"></div></div>
            ) : !selectedProject ? (
                <div className="bg-white rounded-xl shadow-sm border border-concrete-light p-12 text-center text-gray-500">
                    Please select a project to view tools and checkouts.
                </div>
            ) : (
                <div className="space-y-8">
                    
                    {/* INVENTORY SECTION */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Project Inventory</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {tools.map(tool => (
                                <div key={tool._id} className={`bg-white rounded-xl shadow-sm border p-4 flex flex-col hover:shadow-md transition-shadow ${tool.isBlacklisted ? 'border-red-300 bg-red-50' : 'border-concrete-light'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-800 text-sm truncate pr-2">{tool.name}</h3>
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${tool.isBlacklisted ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'}`}>
                                            {tool.isBlacklisted ? 'BLACKLISTED' : tool.category}
                                        </span>
                                    </div>
                                    <p className="text-xs text-concrete mb-1">Stock: <span className="font-semibold text-gray-700">{tool.availableQuantity} / {tool.totalQuantity}</span></p>
                                    <p className="text-xs text-concrete mb-3">Condition: <span className="font-semibold text-gray-700">{tool.condition}</span></p>
                                    
                                    <div className="mt-auto pt-3 border-t border-concrete-light flex justify-between items-center">
                                        <span className="text-xs text-gray-500">{tool.serialNumber || 'No S/N'}</span>
                                        <button 
                                            onClick={() => openCheckoutModal(tool)} 
                                            disabled={tool.availableQuantity < 1 || tool.isBlacklisted}
                                            className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Check Out
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {tools.length === 0 && (
                                <div className="col-span-full py-8 text-center text-gray-500 bg-white rounded-xl border border-dashed">
                                    No tools registered for this project.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ACTIVE CHECKOUTS SECTION */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Active Checkouts</h2>
                        <div className="bg-white rounded-xl shadow-sm border border-concrete-light overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3">Tool</th>
                                            <th className="px-4 py-3">Issued To</th>
                                            <th className="px-4 py-3">Task</th>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">Return Due</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {checkouts.map(c => {
                                            const isActive = c.status === 'Active';
                                            const isOverdue = isActive && new Date(c.expectedReturnDate) < new Date();
                                            return (
                                                <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-gray-800">{c.toolId?.name || 'Unknown Tool'}</td>
                                                    <td className="px-4 py-3 text-gray-600">{c.issuedTo?.name || 'Unknown User'}</td>
                                                    <td className="px-4 py-3 text-gray-500 text-xs">{c.taskId?.name || '-'}</td>
                                                    <td className="px-4 py-3 text-gray-500">{new Date(c.checkoutDate).toLocaleDateString()}</td>
                                                    <td className={`px-4 py-3 ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                                                        {new Date(c.expectedReturnDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${isActive ? 'bg-amber text-white' : 'bg-green-100 text-green-800'}`}>
                                                            {c.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {isActive && (
                                                            <button 
                                                                onClick={() => openReturnModal(c)}
                                                                className="text-emerald-600 hover:text-emerald-800 font-semibold text-xs bg-emerald-50 px-2 py-1 rounded"
                                                            >
                                                                Return
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {checkouts.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">No checkouts found for this project.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Checkout Modal */}
            {isCheckoutModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-blue-50">
                            <h3 className="text-lg font-semibold text-blue-800">Check Out Equipment</h3>
                            <button onClick={() => setIsCheckoutModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-800">Tool: {currentTool?.name}</p>
                                <p className="text-xs text-gray-500">Condition: {currentTool?.condition} | S/N: {currentTool?.serialNumber}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Issue To (Project Member) *</label>
                                <select 
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    value={checkoutFormData.issuedTo} 
                                    onChange={(e) => setCheckoutFormData({ ...checkoutFormData, issuedTo: e.target.value })}
                                    required
                                >
                                    <option value="">-- Select Member --</option>
                                    {members.map(m => <option key={m._id} value={m._id}>{m.name} ({m.email})</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Task (Optional)</label>
                                <select 
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    value={checkoutFormData.taskId} 
                                    onChange={(e) => setCheckoutFormData({ ...checkoutFormData, taskId: e.target.value })}
                                >
                                    <option value="">-- No Specific Task --</option>
                                    {tasks.filter(t => t.projectId === selectedProject && t.status !== 'Completed').map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Return Date *</label>
                                <input 
                                    type="date" 
                                    required
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    value={checkoutFormData.expectedReturnDate}
                                    onChange={(e) => setCheckoutFormData({ ...checkoutFormData, expectedReturnDate: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea 
                                    rows="2"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    value={checkoutFormData.notes}
                                    onChange={(e) => setCheckoutFormData({ ...checkoutFormData, notes: e.target.value })}
                                    placeholder="Optional checkout notes..."
                                />
                            </div>
                        </form>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
                            <button type="button" onClick={() => setIsCheckoutModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium text-sm">Cancel</button>
                            <button type="button" onClick={handleCheckoutSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium text-sm shadow">Confirm Checkout</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Return Modal */}
            {isReturnModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-emerald-50">
                            <h3 className="text-lg font-semibold text-emerald-800">Return Equipment</h3>
                            <button onClick={() => setIsReturnModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleReturnSubmit} className="p-6 space-y-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-800">Tool: {currentCheckout?.toolId?.name}</p>
                                <p className="text-xs text-gray-500">Checked out by: {currentCheckout?.issuedTo?.name}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Return Condition *</label>
                                <select 
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    value={returnFormData.returnCondition} 
                                    onChange={(e) => setReturnFormData({ ...returnFormData, returnCondition: e.target.value })}
                                    required
                                >
                                    <option value="New">New</option>
                                    <option value="Good">Good</option>
                                    <option value="Fair">Fair</option>
                                    <option value="Poor">Poor</option>
                                    <option value="Damaged">Damaged</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Return Notes</label>
                                <textarea 
                                    rows="3"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    value={returnFormData.notes}
                                    onChange={(e) => setReturnFormData({ ...returnFormData, notes: e.target.value })}
                                    placeholder="Any notes about the return, damage, missing parts..."
                                />
                            </div>
                        </form>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
                            <button type="button" onClick={() => setIsReturnModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium text-sm">Cancel</button>
                            <button type="button" onClick={handleReturnSubmit} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-medium text-sm shadow">Confirm Return</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ToolsEquipment;
