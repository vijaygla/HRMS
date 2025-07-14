import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { attendanceService } from '../../services/attendanceService';

interface AttendanceData {
  day: string;
  present: number;
  absent: number;
}

const AttendanceChart: React.FC = () => {
  const [data, setData] = useState<AttendanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      setIsLoading(true);
      try {
        const response = await attendanceService.getAttendanceStats();
        if (response.success && Array.isArray(response.data)) {
          // Assuming backend returns data in the shape: [{ day: 'Mon', present: X, absent: Y }, ...]
          setData(response.data);
        } else {
          console.error('Unexpected attendance data format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

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
        </div>
      </div>

      {isLoading ? (
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : data.length > 0 ? (
        <div className="relative">
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
            </BarChart>
          </ResponsiveContainer>
          {data.every(d => d.present === 0 && d.absent === 0) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-500 text-sm">No attendance data available</p>
            </div>
          )}
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-500 text-sm">No attendance data available</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceChart;
