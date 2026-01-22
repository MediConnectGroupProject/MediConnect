import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";

interface DoctorCalendarProps {
    onSelectDate: (date: Date) => void;
}

export function DoctorCalendar({ onSelectDate }: DoctorCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [monthAppointments, setMonthAppointments] = useState<any[]>([]);
    const [viewDay, setViewDay] = useState<{date: Date, events: any[]} | null>(null);

    useEffect(() => {
        const fetchMonthData = async () => {
            const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0); 
            try {
                const api = await import('../../api/doctorApi');
                const data = await api.getAppointments(null, 'ALL', { start, end });
                setMonthAppointments(data);
            } catch (e) { console.error(e); }
        };
        fetchMonthData();
    }, [currentMonth]);

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay(); // 0 = Sun
    
    const days = [];
    for(let i=0; i<firstDayOfMonth; i++) days.push(null);
    for(let i=1; i<=daysInMonth; i++) days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));

    return (
        <Card className="p-6">
            {/* Detailed Day View Dialog */}
            <Dialog open={!!viewDay} onOpenChange={(o) => !o && setViewDay(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{viewDay?.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</DialogTitle>
                        <DialogDescription>{viewDay?.events.length} Appointments Scheduled</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto space-y-3 my-2">
                        {viewDay?.events.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No appointments for this day.</p>
                        ) : (
                            viewDay?.events.sort((a:any, b:any) => new Date(a.time).getTime() - new Date(b.time).getTime()).map((e: any) => (
                                <div key={e.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                                    e.status === 'in_progress' ? 'bg-blue-50 border-blue-200' : 
                                    e.status === 'completed' ? 'bg-gray-50' : 'bg-white'
                                }`}>
                                    <div className="flex items-center gap-3">
                                            <div className="text-center w-16 text-sm font-medium text-gray-900 border-r pr-3">
                                            {new Date(e.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                            </div>
                                            <div>
                                                <p className="font-medium">{e.patient?.user?.firstName} {e.patient?.user?.lastName}</p>
                                                <Badge variant="outline" className="text-xs mt-1">{e.status.replace('_', ' ').toUpperCase()}</Badge>
                                            </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => {
                            if (viewDay) {
                                onSelectDate(viewDay.date);
                                setViewDay(null);
                            }
                        }}>Go to Daily Schedule</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h3>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>Today</Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-px bg-gray-200 border rounded-lg overflow-hidden">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-500">{d}</div>
                    ))}
                    {days.map((date, i) => {
                        if (!date) return <div key={i} className="bg-white min-h-[120px]" />;
                        
                        const events = monthAppointments.filter((a: any) => new Date(a.date).toDateString() === date.toDateString());
                        const isToday = new Date().toDateString() === date.toDateString();
                        // We don't have selectedDate prop passed in for 'isSelected' styling, but that's fine for now or we can add it.
                        // Actually let's just keep it simple. If we want we can add `selectedDate` prop.

                        return (
                            <div key={i} 
                                className={`bg-white min-h-[120px] p-2 cursor-pointer hover:bg-blue-50 transition-colors border-t border-l ${isToday ? 'bg-blue-50' : ''}`}
                                onClick={() => setViewDay({ date, events })}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
                                        {date.getDate()}
                                    </span>
                                    {events.length > 0 && <Badge variant="secondary" className="text-[10px] h-5 px-1">{events.length}</Badge>}
                                </div>
                                <div className="space-y-1">
                                    {events.slice(0, 3).map((e: any) => (
                                        <div key={e.appointmentId} className={`text-xs truncate px-1.5 py-0.5 rounded ${
                                            e.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                            e.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {new Date(e.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} {e.patient?.user?.lastName}
                                        </div>
                                    ))}
                                    {events.length > 3 && <div className="text-xs text-gray-500 pl-1">+{events.length - 3} more</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
}
