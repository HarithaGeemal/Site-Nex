import React, { useState } from 'react';
import { useSEContext } from '../../context/SEContext';

const SEApprovals = () => {
    const { subtaskApprovals, approveSubtask, fetchSubtaskApprovals } = useSEContext();
    const [submittingId, setSubmittingId] = useState(null);

    const handleApprove = async (task) => {
        const note = prompt("Optional: Leave an approval note for your records");
        if (note === null) return; // Cancelled prompt
        
        try {
            setSubmittingId(task.id);
            await approveSubtask(task.projectId._id || task.projectId, task.id, note || "Approved by Site Engineer");
            alert("Subtask successfully marked as Completed.");
        } catch (error) {
            console.error(error);
        } finally {
            setSubmittingId(null);
        }
    };

    const handleReject = async (task) => {
        // Technically just resetting it to In Progress logic
        alert("Reject function will be mapped to task updater to revert completion request.");
        // TODO: Map to updateTask endpoint if reject workflow is confirmed
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6 border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">Subtask Approvals Pipeline</h1>
                <p className="text-sm text-gray-500 mt-1">Review and approve delegated Subtasks that have been requested for completion by your field teams.</p>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                {subtaskApprovals.length === 0 ? (
                    <div className="p-16 text-center text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900">Inbox Zero</h3>
                        <p className="mt-1">There are no pending subtasks awaiting your approval.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtask Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Task</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {subtaskApprovals.map((task) => (
                                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-gray-900">{task.name}</div>
                                        <div className="text-xs text-gray-500">{task.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-700 font-medium">{task.parentTaskId?.name || 'Unknown Reference'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-700">{task.projectId?.name || 'Unknown Project'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {task.completionRequestedBy?.name || 'Unknown User'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex justify-center gap-3">
                                            <button 
                                                onClick={() => handleApprove(task)}
                                                disabled={submittingId === task.id}
                                                className="text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded disabled:opacity-50 shadow-sm"
                                            >
                                                {submittingId === task.id ? 'Approving...' : 'Approve'}
                                            </button>
                                            <button 
                                                onClick={() => handleReject(task)}
                                                disabled={submittingId === task.id}
                                                className="text-red-600 hover:text-white hover:bg-red-600 px-3 py-1.5 rounded border border-red-600 disabled:opacity-50 transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default SEApprovals;
