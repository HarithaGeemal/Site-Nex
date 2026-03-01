import React, { useState } from 'react';
import { usePMContext } from '../../context/PMContext';

const Workers = () => {
    const { workers, addWorker, updateWorker, deleteWorker } = usePMContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentWorker, setCurrentWorker] = useState(null);

    // form state
    const [formData, setFormData] = useState({
        name: '', role: 'Skilled Worker', trade: '', phone: '', status: 'Active'
    });

    const openModal = (worker = null) => {
        if (worker) {
            setCurrentWorker(worker);
            setFormData(worker);
        } else {
            setCurrentWorker(null);
            setFormData({ name: '', role: 'Skilled Worker', trade: '', phone: '', status: 'Active' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentWorker(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentWorker) {
            updateWorker(currentWorker.id, formData);
        } else {
            addWorker(formData);
        }
        closeModal();
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this worker?")) {
            deleteWorker(id);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-navy-dark">Worker Management</h1>
                <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
                    + Add New Worker
                </button>
            </div>

            {/* Grid of Workers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {workers.map(worker => (
                    <div key={worker.id} className="bg-white rounded-lg shadow p-5 border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-lg font-semibold text-gray-800">{worker.name}</h2>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${worker.status === 'Active' ? 'bg-green-100 text-green-800' : worker.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                {worker.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">{worker.role}</p>
                        <p className="text-xs text-blue-600 font-medium mb-4">{worker.trade}</p>

                        <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex items-center">
                                <span className="font-medium text-gray-500 mr-2">Phone:</span>
                                <span>{worker.phone}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
                            <button onClick={() => openModal(worker)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                            <button onClick={() => handleDelete(worker.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">{currentWorker ? 'Edit Worker' : 'Add New Worker'}</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select name="role" value={formData.role} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2">
                                    <option value="Foreman">Foreman</option>
                                    <option value="Skilled Worker">Skilled Worker</option>
                                    <option value="General Laborer">General Laborer</option>
                                    <option value="Operator">Operator</option>
                                    <option value="Supervisor">Supervisor</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trade/Specialty</label>
                                <input type="text" name="trade" value={formData.trade} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2">
                                    <option value="Active">Active</option>
                                    <option value="On Leave">On Leave</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </form>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
                            <button type="button" onClick={closeModal} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
                            <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">Save Worker</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Workers;
