import React, { useState, useEffect } from 'react';
import useAxios from '../../hooks/useAxios';
import { useWorkerContext } from '../../context/WorkerContext';

const statusColors = {
    'Pending SE Approval': 'bg-orange-100 text-orange-800 border-orange-200',
    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Approved': 'bg-green-100 text-green-800 border-green-200',
    'Denied': 'bg-red-100 text-red-800 border-red-200',
};

const WorkerMaterials = () => {
    const axiosClient = useAxios();
    const { assignedTasks, assignedSubtasks } = useWorkerContext();

    const [requests, setRequests] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [globalMaterials, setGlobalMaterials] = useState([]);

    // Form state
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState([{ requestType: 'Material', itemId: '', quantityRequested: 1 }]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const { data } = await axiosClient.get('/worker/material-requests');
            if (data.success) setRequests(data.requests);
        } catch (err) {
            console.error("Failed to fetch requests", err);
        } finally {
            setLoading(false);
        }
    };

    const loadMaterialCatalog = async () => {
        try {
            const { data } = await axiosClient.get('/materials/items');
            if (data.success) setGlobalMaterials(data.items);
        } catch (err) {
            console.error("Failed to load catalog", err);
        }
    };

    useEffect(() => {
        fetchRequests();
        loadMaterialCatalog();
    }, []);

    const allTasks = [...assignedTasks, ...assignedSubtasks];

    const handleAddItem = () => setItems([...items, { requestType: 'Material', itemId: '', quantityRequested: 1 }]);
    const handleRemoveItem = (index) => setItems(items.filter((_, i) => i !== index));
    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        if (field === 'requestType') newItems[index].itemId = '';
        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTaskId) { alert("Select a task."); return; }
        const validItems = items.filter(i => i.itemId && i.quantityRequested > 0);
        if (!validItems.length) { alert("Add at least one item."); return; }

        try {
            const { data } = await axiosClient.post('/worker/material-requests', {
                taskId: selectedTaskId, items: validItems, notes
            });
            if (data.success) {
                alert("Request sent to your Site Engineer for approval!");
                setIsModalOpen(false);
                setSelectedTaskId('');
                setNotes('');
                setItems([{ requestType: 'Material', itemId: '', quantityRequested: 1 }]);
                fetchRequests();
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to submit request.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Withdraw this request?")) return;
        try {
            const { data } = await axiosClient.delete(`/worker/material-requests/${id}`);
            if (data.success) {
                alert("Request withdrawn.");
                fetchRequests();
            }
        } catch (err) {
            alert(err.response?.data?.message || "Cannot delete this request.");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Material & Tool Requests</h1>
                    <p className="text-sm text-gray-500 mt-1">Submit resource requests to your Site Engineer for approval.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-steel-blue hover:bg-steel-blue/90 text-white px-4 py-2 rounded shadow-sm font-medium transition-colors">
                    + New Request
                </button>
            </div>

            {/* Request List */}
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-16 text-center text-gray-400 animate-pulse">Loading requests...</div>
                ) : requests.length === 0 ? (
                    <div className="p-16 text-center text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        <h3 className="text-lg font-medium text-gray-900">No Requests</h3>
                        <p className="mt-1">You haven't submitted any material or tool requests yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {requests.map((req) => (
                            <div key={req._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-center gap-6 flex-1 min-w-0">
                                    <div className="text-sm text-gray-500 w-24 shrink-0">
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="w-36 shrink-0">
                                        <div className="text-sm font-bold text-gray-800">{req.projectId?.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-400">{req.taskId?.name || 'Unknown Task'}</div>
                                    </div>
                                    <div className="text-sm text-gray-600 flex-1 min-w-0">
                                        {req.materialItemId ? (
                                            <span><span className="font-semibold text-blue-700">[Material]</span> {req.materialItemId?.name || 'Unknown'} - {req.requestedQuantity} {req.materialItemId?.unit || 'units'}</span>
                                        ) : req.toolId ? (
                                            <span><span className="font-semibold text-orange-700">[Tool]</span> {req.toolId?.name || 'Unknown'} - {req.requestedQuantity} units</span>
                                        ) : (
                                            <span>Unknown - {req.requestedQuantity}</span>
                                        )}
                                        {req.notes && <p className="mt-1 text-xs text-gray-400 italic">Note: {req.notes}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0 ml-4">
                                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${statusColors[req.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                                        {req.status}
                                    </span>
                                    {req.status === 'Pending SE Approval' && (
                                        <button onClick={() => handleDelete(req._id)} className="text-red-500 hover:text-red-700 text-xs font-medium border border-red-200 rounded px-2 py-1 hover:bg-red-50 transition-colors">
                                            Withdraw
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">New Resource Request</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Related Task / Subtask</label>
                                    <select value={selectedTaskId} onChange={(e) => setSelectedTaskId(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 bg-white" required>
                                        <option value="" disabled>Select task...</option>
                                        {allTasks.map(t => (
                                            <option key={t._id || t.id} value={t._id || t.id}>
                                                {t.name} {t.projectId?.name ? `(${t.projectId.name})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest">Items Needed</label>
                                        <button type="button" onClick={handleAddItem} className="text-steel-blue text-sm font-semibold hover:underline bg-white px-3 py-1 border rounded shadow-sm">+ Add Item</button>
                                    </div>
                                    <div className="space-y-3">
                                        {items.map((item, index) => (
                                            <div key={index} className="flex gap-3 items-center bg-white p-3 rounded border border-gray-200 shadow-sm">
                                                <select value={item.requestType} onChange={(e) => handleItemChange(index, 'requestType', e.target.value)} className="w-28 border border-gray-300 rounded px-2 py-2 text-sm bg-gray-50 font-medium">
                                                    <option value="Material">Material</option>
                                                    <option value="Tool">Tool</option>
                                                </select>
                                                <select value={item.itemId} onChange={(e) => handleItemChange(index, 'itemId', e.target.value)} className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-sm" required>
                                                    <option value="" disabled>Select {item.requestType.toLowerCase()}...</option>
                                                    {item.requestType === 'Material' && globalMaterials.map(m => (
                                                        <option key={m._id} value={m._id}>{m.name} ({m.unit})</option>
                                                    ))}
                                                </select>
                                                <input type="number" min="1" value={item.quantityRequested} onChange={(e) => handleItemChange(index, 'quantityRequested', Number(e.target.value))} className="w-20 border border-gray-300 rounded px-2 py-2 text-sm" placeholder="Qty" required />
                                                {items.length > 1 && (
                                                    <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 p-1">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="2" placeholder="Reason, urgency, etc." className="w-full border border-gray-300 rounded px-3 py-2" />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-steel-blue text-white rounded hover:bg-steel-blue/90 font-medium">Submit to Site Engineer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkerMaterials;
