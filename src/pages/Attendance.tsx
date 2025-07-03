import React, { useState } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, Download } from 'lucide-react';
import { format, subDays, addDays } from 'date-fns';

const Attendance: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Mock attendance data
  const attendanceData = [
    {
      id: 1,
      employee: 'Sarah Johnson',
      avatar: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
      department: 'Engineering',
      checkIn: '09:15 AM',
      checkOut: '06:30 PM',
      workingHours: '8h 45m',
      status: 'Present',
      location: 'Office'
    },
    {
      id: 2,
      employee: 'Michael Chen',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
      department: 'Sales',
      checkIn: '08:45 AM',
      checkOut: '05:15 PM',
      workingHours: '8h 30m',
      status: 'Present',
      location: 'Remote'
    },
    {
      id: 3,
      employee: 'Emma Wilson',
      avatar: 'https://images.pexels.com/photos/3823495/pexels-photo-3823495.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
      department: 'Marketing',
      checkIn: '-',
      checkOut: '-',
      workingHours: '-',
      status: 'On Leave',
      location: '-'
    },
    {
      id: 4,
      employee: 'David Rodriguez',
      avatar: 'https://images.pexels.com/photos/3777931/pexels-photo-3777931.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
      department: 'HR',
      checkIn: '09:30 AM',
      checkOut: '-',
      workingHours: 'In Progress',
      status: 'Present',
      location: 'Office'
    }
  ];

  const stats = [
    {
      title: 'Total Employees',
      value: '234',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Present Today',
      value: '218',
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Absent',
      value: '8',
      icon: XCircle,
      color: 'red'
    },
    {
      title: 'On Leave',
      value: '8',
      icon: Calendar,
      color: 'orange'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'On Leave':
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
        <div className="flex gap-3">
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
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
              <p className="text-lg font-semibold text-gray-900">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
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
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Working Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={record.avatar}
                        alt={record.employee}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium text-gray-900">{record.employee}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {record.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.checkIn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.checkOut}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.workingHours}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {record.location}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;