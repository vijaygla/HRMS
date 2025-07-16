import React, { useState, useEffect } from 'react';
import { Users, Building2, Clock, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import AttendanceChart from '../components/dashboard/AttendanceChart';
import DepartmentChart from '../components/dashboard/DepartmentChart';
import { employeeService } from '../services/employeeService';
import { departmentService } from '../services/departmentService';
import { attendanceService } from '../services/attendanceService';
import { leaveService } from '../services/leaveService';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    presentToday: 0,
    onLeave: 0,
    pendingLeaves: 0,
    totalPayroll: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all required data in parallel
      const [employeesRes, departmentsRes, attendanceRes, leaveRes] = await Promise.allSettled([
        employeeService.getEmployees({ limit: 1 }),
        departmentService.getDepartments(),
        attendanceService.getAttendanceStats(),
        leaveService.getLeaveStats()
      ]);

      let newStats = {
        totalEmployees: 0,
        totalDepartments: 0,
        presentToday: 0,
        onLeave: 0,
        pendingLeaves: 0,
        totalPayroll: 0
      };

      // Process employees data
      if (employeesRes.status === 'fulfilled' && employeesRes.value.success) {
        newStats.totalEmployees = employeesRes.value.total || 0;
      }

      // Process departments data
      if (departmentsRes.status === 'fulfilled' && departmentsRes.value.success) {
        newStats.totalDepartments = departmentsRes.value.count || 0;
      }

      // Process attendance data
      if (attendanceRes.status === 'fulfilled' && attendanceRes.value.success) {
        const attendanceData = attendanceRes.value.data;
        if (attendanceData?.today) {
          const presentCount = attendanceData.today.find((item: any) => 
            item._id === 'present' || item._id === 'late'
          )?.count || 0;
          newStats.presentToday = presentCount;
        }
      }

      // Process leave data
      if (leaveRes.status === 'fulfilled' && leaveRes.value.success) {
        const leaveData = leaveRes.value.data;
        if (leaveData?.byStatus) {
          const approvedLeaves = leaveData.byStatus.find((item: any) => item._id === 'approved')?.count || 0;
          const pendingLeaves = leaveData.byStatus.find((item: any) => item._id === 'pending')?.count || 0;
          newStats.onLeave = approvedLeaves;
          newStats.pendingLeaves = pendingLeaves;
        }
      }

      setStats(newStats);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const dashboardStats = [
    {
      title: 'Total Employees',
      value: isLoading ? '...' : stats.totalEmployees.toString(),
      change: stats.totalEmployees > 0 ? '+12%' : '0%',
      trend: 'up' as const,
      icon: Users,
      color: 'blue' as const
    },
    {
      title: 'Departments',
      value: isLoading ? '...' : stats.totalDepartments.toString(),
      change: stats.totalDepartments > 0 ? '+2' : '0',
      trend: 'up' as const,
      icon: Building2,
      color: 'green' as const
    },
    {
      title: 'Present Today',
      value: isLoading ? '...' : stats.presentToday.toString(),
      change: stats.presentToday > 0 ? '93.7%' : '0%',
      trend: stats.presentToday > 0 ? 'up' as const : 'down' as const,
      icon: Clock,
      color: 'emerald' as const
    },
    {
      title: 'On Leave',
      value: isLoading ? '...' : stats.onLeave.toString(),
      change: stats.onLeave > 0 ? '-5%' : '0%',
      trend: stats.onLeave > 0 ? 'down' as const : 'up' as const,
      icon: Calendar,
      color: 'orange' as const
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening in your organization.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart />
        <DepartmentChart />
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
};

export default Dashboard;

