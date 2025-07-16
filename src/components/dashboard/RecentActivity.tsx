import React, { useState, useEffect } from 'react';
import { Clock, UserPlus, Calendar, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { employeeService } from '../../services/employeeService';
import { leaveService } from '../../services/leaveService';
import { attendanceService } from '../../services/attendanceService';

interface Activity {
  id: string;
  type: string;
  user: string;
  action: string;
  time: string;
  icon: any;
  color: string;
}

const RecentActivity: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      setIsLoading(true);
      
      // Fetch recent data from different sources
      const [employeesRes, leavesRes, attendanceRes] = await Promise.allSettled([
        employeeService.getEmployees({ limit: 5 }),
        leaveService.getLeaves({ limit: 5 }),
        attendanceService.getAttendance({ limit: 5 })
      ]);

      const recentActivities: Activity[] = [];

      // Process recent employees
      if (employeesRes.status === 'fulfilled' && employeesRes.value.success) {
        const employees = employeesRes.value.data || [];
        employees.slice(0, 3).forEach((emp: any, index: number) => {
          recentActivities.push({
            id: `emp-${emp._id}`,
            type: 'employee',
            user: `${emp.personalInfo?.firstName} ${emp.personalInfo?.lastName}`,
            action: 'joined the company',
            time: new Date(emp.createdAt).toLocaleDateString(),
            icon: UserPlus,
            color: 'bg-green-100 text-green-600'
          });
        });
      }

      // Process recent leaves
      if (leavesRes.status === 'fulfilled' && leavesRes.value.success) {
        const leaves = leavesRes.value.data || [];
        leaves.slice(0, 2).forEach((leave: any) => {
          const icon = leave.status === 'approved' ? CheckCircle : 
                      leave.status === 'rejected' ? XCircle : Calendar;
          const color = leave.status === 'approved' ? 'bg-green-100 text-green-600' :
                       leave.status === 'rejected' ? 'bg-red-100 text-red-600' :
                       'bg-yellow-100 text-yellow-600';
          
          recentActivities.push({
            id: `leave-${leave._id}`,
            type: 'leave',
            user: `${leave.employee?.personalInfo?.firstName} ${leave.employee?.personalInfo?.lastName}`,
            action: `${leave.status === 'pending' ? 'applied for' : leave.status} ${leave.leaveType} leave`,
            time: new Date(leave.appliedDate).toLocaleDateString(),
            icon,
            color
          });
        });
      }

      // Process recent attendance
      if (attendanceRes.status === 'fulfilled' && attendanceRes.value.success) {
        const attendance = attendanceRes.value.data || [];
        attendance.slice(0, 2).forEach((att: any) => {
          recentActivities.push({
            id: `att-${att._id}`,
            type: 'attendance',
            user: `${att.employee?.personalInfo?.firstName} ${att.employee?.personalInfo?.lastName}`,
            action: `checked ${att.checkOut?.time ? 'out' : 'in'}`,
            time: new Date(att.date).toLocaleDateString(),
            icon: Clock,
            color: 'bg-blue-100 text-blue-600'
          });
        });
      }

      // Sort by most recent and limit to 5
      recentActivities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setActivities(recentActivities.slice(0, 5));

    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button 
          onClick={fetchRecentActivities}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Refresh
        </button>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.color}`}>
                <activity.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user}</span> {activity.action}
                </p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">No recent activity to display</p>
          <p className="text-gray-400 text-xs mt-1">Activity will appear here as users interact with the system</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;

