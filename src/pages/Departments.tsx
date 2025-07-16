import React, { useState, useEffect } from 'react';
import { Plus, Users, TrendingUp, Edit, Trash2, Building2, MapPin, DollarSign } from 'lucide-react';
import { departmentService } from '../services/departmentService';
import AddDepartmentModal from '../components/departments/AddDepartmentModal';

import toast from 'react-hot-toast';

interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  manager?: {
    personalInfo: {
      firstName: string;
      lastName: string;
    };
  };
  budget?: number;
  location?: string;
  employeeCount?: number;
  isActive: boolean;
  createdAt: string;
}

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [stats, setStats] = useState({
    totalDepartments: 0,
    totalEmployees: 0,
    totalBudget: 0,
    averageBudget: 0
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching departments...');
      const response = await departmentService.getDepartments();
      console.log('Departments response:', response);
      
      if (response.success) {
        const departmentData = response.data || [];
        setDepartments(departmentData);
        
        // Calculate stats
        const totalEmployees = departmentData.reduce((sum: number, dept: Department) => sum + (dept.employeeCount || 0), 0);
        const totalBudget = departmentData.reduce((sum: number, dept: Department) => sum + (dept.budget || 0), 0);
        const averageBudget = departmentData.length > 0 ? totalBudget / departmentData.length : 0;
        
        setStats({
          totalDepartments: departmentData.length,
          totalEmployees,
          totalBudget,
          averageBudget
        });

        if (departmentData.length === 0) {
          toast('No departments found. Create your first department to get started!', {
            icon: '🏢',
          });
        }
      } else {
        toast.error(response.message || 'Failed to load departments');
        setDepartments([]);
      }
    } catch (error: any) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load departments. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDepartment = async (departmentId: string, departmentName: string) => {
    if (window.confirm(`Are you sure you want to delete ${departmentName}? This action cannot be undone.`)) {
      try {
        const response = await departmentService.deleteDepartment(departmentId);
        if (response.success) {
          toast.success(`${departmentName} has been deleted successfully.`);
          fetchDepartments(); // Refresh the list
        } else {
          toast.error(response.message || 'Failed to delete department');
        }
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete department';
        toast.error(errorMessage);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getDepartmentColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-red-500',
      'bg-cyan-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-teal-500'
    ];
    return colors[index % colors.length];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-2">Manage organizational departments and structure</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {/* Enhanced Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDepartments}</p>
              <p className="text-sm text-gray-600">Total Departments</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
              <p className="text-sm text-gray-600">Total Employees</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalBudget)}</p>
              <p className="text-sm text-gray-600">Total Budget</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageBudget)}</p>
              <p className="text-sm text-gray-600">Average Budget</p>
            </div>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      {departments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department, index) => (
            <div key={department._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${getDepartmentColor(index)} rounded-lg flex items-center justify-center`}>
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{department.name}</h3>
                    <p className="text-sm text-blue-600 font-medium">Code: {department.code}</p>
                  </div>
                </div>
              </div>

              {department.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{department.description}</p>
              )}

              {/* Department Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Manager:</span>
                  <span className="font-medium text-gray-900">
                    {department.manager 
                      ? `${department.manager.personalInfo.firstName} ${department.manager.personalInfo.lastName}`
                      : 'Not Assigned'
                    }
                  </span>
                </div>
                
                {department.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{department.location}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Created:</span>
                  <span className="text-gray-900">{formatDate(department.createdAt)}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{department.employeeCount || 0}</p>
                  <p className="text-xs text-gray-600">Employees</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-900">
                    {department.budget ? formatCurrency(department.budget) : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-600">Budget</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={() => toast('View department details coming soon!', { icon: '👀' })}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  View Details
                </button>
                <button 
                  onClick={() => toast('Edit department feature coming soon!', { icon: '✏️' })}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteDepartment(department._id, department.name)}
                  className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
            <p className="text-gray-500 mb-6">
              Get started by creating your first department to organize your workforce.
            </p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Department
            </button>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      <AddDepartmentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchDepartments}
      />
    </div>
  );
};

export default Departments;

