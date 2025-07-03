import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { departmentService } from '../../services/departmentService';

interface DepartmentData {
  name: string;
  value: number;
  color: string;
}

const DepartmentChart: React.FC = () => {
  const [data, setData] = useState<DepartmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        setIsLoading(true);
        const response = await departmentService.getDepartments();
        
        if (response.success && response.data) {
          const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
          
          const chartData = response.data.map((dept: any, index: number) => ({
            name: dept.name,
            value: dept.employeeCount || 0,
            color: colors[index % colors.length]
          })).filter((dept: DepartmentData) => dept.value > 0);
          
          setData(chartData);
        }
      } catch (error) {
        console.error('Error fetching department data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartmentData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Department Distribution</h3>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Department Distribution</h3>
      </div>
      
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }} 
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              wrapperStyle={{ paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 text-sm">No department data available</p>
            <p className="text-gray-400 text-xs mt-1">Add departments and employees to see distribution</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentChart;