import React, { useEffect, useState } from 'react';
import StaffPageShell from './StaffPageShell';
import { staffService } from '../../services/staffService';
import { Calendar, Users, CheckCircle } from 'lucide-react';

const StaffDashboard = () => {
    const [schedule, setSchedule] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);

    useEffect(() => {
        staffService.getSchedule().then(setSchedule).catch(console.error);
        staffService.getSessions().then(setSessions).catch(console.error);
    }, []);

    const todaySessions = sessions.filter(s => s.sessionDate === new Date().toISOString().split('T')[0]);
    const completedToday = todaySessions.filter(s => s.isCompleted).length;

    return (
        <StaffPageShell
            title="Overview"
            description="Quick insights of your coaching day."
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center shadow-sm">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h3 className="text-slate-500 text-sm font-medium">Today's Sessions</h3>
                            <p className="text-2xl font-bold text-slate-800">{todaySessions.length}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center shadow-sm">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mr-4">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-slate-500 text-sm font-medium">Completed Today</h3>
                            <p className="text-2xl font-bold text-slate-800">{completedToday}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center shadow-sm">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-4">
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 className="text-slate-500 text-sm font-medium">Upcoming Total</h3>
                            <p className="text-2xl font-bold text-slate-800">{sessions.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Upcoming Sessions</h3>
                     <div className="space-y-3">
                        {todaySessions.filter(s => !s.isCompleted).slice(0, 5).map((s: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                                <div>
                                    <p className="text-slate-800 font-semibold">{s.startTime} - {s.endTime}</p>
                                    <p className="text-sm text-slate-500">Student: {s.studentName}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700`}>
                                    Pending
                                </span>
                            </div>
                        ))}
                        {todaySessions.filter(s => !s.isCompleted).length === 0 && (
                             <p className="text-slate-500 text-sm">No upcoming sessions today.</p>
                        )}
                    </div>
                </div>
            </div>
        </StaffPageShell>
    );
};

export default StaffDashboard;
