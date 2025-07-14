import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, Download } from 'lucide-react';
import { format, subDays, addDays } from 'date-fns';
import { attendanceService } from '../services/attendanceService'; // Adjust the import path as necessary

const Attendance: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch attendance list for selected date
  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const dateParam = format(selectedDate, 'yyyy-MM-dd');
      const res = await attendanceService.getAttendance({ date: dateParam });
      // API returns { data: [...], ... }
      setAttendanceData(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  // Fetch today's stats
  const fetchStats = async () => {
    try {
      const res = await attendanceService.getAttendanceStats();
      // res.data.today is array of {_id: status, count}
      const todayStats = res.data.today;
      // Build stats cards
      const total = todayStats.reduce((sum: number, s: any) => sum + s.count, 0);
      const mapped = [
        { title: 'Total Today', value: String(total), icon: Users, color: 'blue' },
        { title: 'Present', value: String(todayStats.find((s: any) => s._id === 'present')?.count || 0), icon: CheckCircle, color: 'green' },
        { title: 'Absent', value: String(todayStats.find((s: any) => s._id === 'absent')?.count || 0), icon: XCircle, color: 'red' },
        { title: 'On Leave', value: String(todayStats.find((s: any) => s._id === 'on leave')?.count || 0), icon: Calendar, color: 'orange' }
      ];
      setStats(mapped);
    } catch (err) {
      console.error('Stats load failed', err);
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchStats();
  }, [selectedDate]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'on leave':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-2">Track employee attendance and working hours</p>
        </div>
        <button
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          onClick={() => {
            // export functionality can go here
          }}
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Date Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
              <p className="text-sm text-gray-600">Attendance Overview</p>
            </div>
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              →
            </button>
          </div>
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Daily Attendance</h3>
        </div>
        {loading && <p className="p-6">Loading...</p>}
        {error && <p className="p-6 text-red-600">{error}</p>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                      <img src={record.employee.avatar} alt={record.employee.name} className="w-8 h-8 rounded-full object-cover" />
                      <span className="text-sm font-medium text-gray-900">{record.employee.personalInfo.firstName} {record.employee.personalInfo.lastName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.employee.jobInfo.department.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{format(new Date(record.checkIn.time), 'hh:mm a')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.checkOut?.time ? format(new Date(record.checkOut.time), 'hh:mm a') : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.workingHours || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>{record.status}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.checkIn.location || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
