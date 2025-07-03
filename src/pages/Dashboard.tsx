import React, { useState, useEffect } from 'react';
import { Users, Building2, Clock, Calendar } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import AttendanceChart from '../components/dashboard/AttendanceChart';
import DepartmentChart from '../components/dashboard/DepartmentChart';
import { employeeService } from '../services/employeeService';
import { departmentService } from '../services/departmentService';
import { attendanceService } from '../services/attendanceService';
import { leaveService } from '../services/leaveService';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    presentToday: 0,
    onLeave: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all required data
        const [employeesRes, departmentsRes, attendanceRes, leaveRes] = await Promise.allSettled([
          employeeService.getEmployees({ limit: 1 }),
          departmentService.getDepartments(),
          attendanceService.getAttendanceStats(),
          leaveService.getLeaveStats()
        ]);

        // Process employees data
        if (employeesRes.status === 'fulfilled') {
          setStats(prev => ({ ...prev, totalEmployees: employeesRes.value.total || 0 }));
        }

        // Process departments data
        if (departmentsRes.status === 'fulfilled') {
          setStats(prev => ({ ...prev, totalDepartments: departmentsRes.value.count || 0 }));
        }

        // Process attendance data
        if (attendanceRes.status === 'fulfilled') {
          const attendanceData = attendanceRes.value.data;
          const presentCount = attendanceData?.today?.find((item: any) => item._id === 'present')?.count || 0;
          setStats(prev => ({ ...prev, presentToday: presentCount }));
        }

        // Process leave data
        if (leaveRes.status === 'fulfilled') {
          const leaveData = leaveRes.value.data;
          const onLeaveCount = leaveData?.byStatus?.find((item: any) => item._id === 'approved')?.count || 0;
          setStats(prev => ({ ...prev, onLeave: onLeaveCount }));
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const dashboardStats = [
    {
      title: 'Total Employees',
      value: isLoading ? '...' : stats.totalEmployees.toString(),
      change: '+12%',
      trend: 'up' as const,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Departments',
      value: isLoading ? '...' : stats.totalDepartments.toString(),
      change: '+2',
      trend: 'up' as const,
      icon: Building2,
      color: 'green'
    },
    {
      title: 'Present Today',
      value: isLoading ? '...' : stats.presentToday.toString(),
      change: '93.7%',
      trend: 'up' as const,
      icon: Clock,
      color: 'emerald'
    },
    {
      title: 'On Leave',
      value: isLoading ? '...' : stats.onLeave.toString(),
      change: '-5%',
      trend: 'down' as const,
      icon: Calendar,
      color: 'orange'
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