import React, { useEffect, useState } from 'react';
import StaffPageShell from './StaffPageShell';
import { staffService } from '../../services/staffService';
import { MessageSquare, Check, XCircle } from 'lucide-react';

const SessionManagement = () => {
    const [sessions, setSessions] = useState<any[]>([]);
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = () => staffService.getSessions().then(setSessions).catch(console.error);

    const handleComplete = async () => {
        if (!selectedSession) return;
        try {
            await staffService.completeSession(selectedSession.id, notes);
            setSelectedSession(null);
            setNotes('');
            loadSessions();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <StaffPageShell
            title="Session Management"
            description="Manage your ongoing coaching sessions, add notes, and complete them."
        >
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-sm">
                                <th className="p-4 font-semibold text-slate-700">Date/Time</th>
                                <th className="p-4 font-semibold text-slate-700">Student</th>
                                <th className="p-4 font-semibold text-slate-700">Type</th>
                                <th className="p-4 font-semibold text-slate-700">Status</th>
                                <th className="p-4 font-semibold text-slate-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-sm">
                            {sessions.map((s: any, idx: number) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 text-slate-800 font-medium">
                                        <div className="flex flex-col">
                                            <span>{s.sessionDate}</span>
                                            <span className="text-slate-500 font-normal">{s.startTime} - {s.endTime}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-800">{s.studentName}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${s.isGroupSession ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {s.isGroupSession ? `Group (${s.maxParticipants} max)` : 'Private'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {s.isCompleted ? (
                                            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full">
                                                <Check size={14} /> Completed
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-amber-600 font-medium bg-amber-50 px-2.5 py-1 rounded-full">
                                                <ClockIcon size={14} /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        {!s.isCompleted && (
                                            <button
                                                onClick={() => setSelectedSession(s)}
                                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all"
                                            >
                                                Complete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {sessions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        No sessions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedSession && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-200">
                            <h3 className="text-xl font-bold text-slate-800">Complete Session</h3>
                            <button aria-label="Close session modal" title="Close" onClick={() => setSelectedSession(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-sm">
                                <p><span className="font-semibold text-slate-700">Student:</span> {selectedSession.studentName}</p>
                                <p><span className="font-semibold text-slate-700">Time:</span> {selectedSession.sessionDate} {selectedSession.startTime} - {selectedSession.endTime}</p>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                    <MessageSquare size={16} /> Coach Notes
                                </label>
                                <textarea
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"
                                    rows={4}
                                    placeholder="Add any notes about student progress, techniques covered, or homework..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedSession(null)}
                                className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleComplete}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-sm shadow-blue-200"
                            >
                                Mark as Complete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </StaffPageShell>
    );
};

const ClockIcon = ({ size }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

export default SessionManagement;
