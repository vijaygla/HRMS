import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { attendanceService } from '../../services/attendanceService';
import { format, subDays } from 'date-fns';

interface AttendanceData {
  day: string;
  present: number;
  absent: number;
  late: number;
}

const AttendanceChart: React.FC = () => {
  const [data, setData] = useState<AttendanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setIsLoading(true);
      
      // Get last 7 days of attendance data
      const weekData: AttendanceData[] = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const dayName = format(date, 'EEE');
        const dateStr = format(date, 'yyyy-MM-dd');
        
        try {
          const response = await attendanceService.getAttendance({ date: dateStr });
          
          if (response.success && response.data) {
            const dayData = response.data;
            const present = dayData.filter((record: any) => record.status === 'present').length;
            const absent = dayData.filter((record: any) => record.status === 'absent').length;
            const late = dayData.filter((record: any) => record.status === 'late').length;
            
            weekData.push({
              day: dayName,
              present,
              absent,
              late
            });
          } else {
            weekData.push({
              day: dayName,
              present: 0,
              absent: 0,
              late: 0
            });
          }
        } catch (error) {
          weekData.push({
            day: dayName,
            present: 0,
            absent: 0,
            late: 0
          });
        }
      }
      
      setData(weekData);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      // Set empty data for 7 days
      const emptyData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
        day,
        present: 0,
        absent: 0,
        late: 0
      }));
      setData(emptyData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Weekly Attendance</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600">Late</span>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }} 
            />
            <Bar dataKey="present" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
      
      {!isLoading && data.every(d => d.present === 0 && d.absent === 0 && d.late === 0) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 text-sm">No attendance data available</p>
            <p className="text-gray-400 text-xs mt-1">Data will appear here once employees start checking in</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceChart;

