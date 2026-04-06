import React, { useEffect, useState } from 'react';
import StaffPageShell from './StaffPageShell';
import { staffService } from '../../services/staffService';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

const StaffSchedule = () => {
    const [availability, setAvailability] = useState<any[]>([]);

    useEffect(() => {
        staffService.getAvailability().then(setAvailability).catch(console.error);
    }, []);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
        <StaffPageShell
            title="My Schedule"
            description="Manage your availability and view your overall weekly schedule."
        >
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
                    <CalendarIcon className="text-slate-500" size={20} />
                    <h3 className="text-lg font-bold text-slate-800">Weekly Availability</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {days.map((day, index) => {
                        const dayAvail = availability.filter(a => a.dayOfWeek === index);
                        return (
                            <div key={index} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                                <div className="w-32 flex-shrink-0">
                                    <span className="font-semibold text-slate-700">{day}</span>
                                </div>
                                <div className="flex-1 flex flex-wrap gap-3">
                                    {dayAvail.length > 0 ? (
                                        dayAvail.map((a: any, i: number) => (
                                            <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm border ${a.isBlocked ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                                <Clock size={14} />
                                                <span>{a.startTime} - {a.endTime}</span>
                                                {a.isBlocked && <span className="ml-1 text-xs uppercase tracking-wider font-bold opacity-75">(Blocked)</span>}
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-sm text-slate-400 italic">No availability set</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </StaffPageShell>
    );
};

export default StaffSchedule;
