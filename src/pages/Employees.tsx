import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Download, MoreVertical, Mail, Phone, Trash2, Edit, Eye } from 'lucide-react';
import { employeeService } from '../services/employeeService';
import { departmentService } from '../services/departmentService';
import AddEmployeeModal from '../components/employees/AddEmployeeModal';
import toast from 'react-hot-toast';

interface Employee {
  _id: string;
  employeeId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
  user: {
    email: string;
    avatar?: string;
  };
  jobInfo: {
    position: string;
    department: {
      name: string;
    };
    employmentType: string;
    joinDate: string;
  };
  salary: {
    baseSalary: number;
    currency: string;
  };
  status: string;
  createdAt: string;
}

interface Department {
  _id: string;
  name: string;
}

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, [searchTerm, selectedDepartment, selectedStatus, pagination.page]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (selectedDepartment !== 'all') {
        params.department = selectedDepartment;
      }

      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }

      console.log('Fetching employees with params:', params);
      const response = await employeeService.getEmployees(params);
      console.log('Employees response:', response);
      
      if (response.success) {
        setEmployees(response.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.total || 0,
          pages: response.pagination?.pages || 0
        }));
        
        if (response.data?.length === 0 && (searchTerm || selectedDepartment !== 'all' || selectedStatus !== 'all')) {
          toast('No employees found matching your criteria.', {
            icon: '🔍',
          });
        }
      } else {
        toast.error(response.message || 'Failed to load employees');
        setEmployees([]);
      }
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load employees. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getDepartments();
      if (response.success) {
        setDepartments(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleDeleteEmployee = async (employeeId: string, employeeName: string) => {
    if (window.confirm(`Are you sure you want to delete ${employeeName}? This action cannot be undone.`)) {
      try {
        const response = await employeeService.deleteEmployee(employeeId);
        if (response.success) {
          toast.success(`${employeeName} has been deleted successfully.`);
          fetchEmployees(); // Refresh the list
        } else {
          toast.error(response.message || 'Failed to delete employee');
        }
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete employee. Please try again.';
        toast.error(errorMessage);
      }
    }
  };

  const handleExport = () => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => resolve('Export completed'), 2000);
      }),
      {
        loading: 'Exporting employee data...',
        success: 'Employee data exported successfully!',
        error: 'Failed to export data.',
      }
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('all');
    setSelectedStatus('all');
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.success('Filters cleared');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'on-leave':
        return 'bg-orange-100 text-orange-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-2">Manage your organization's workforce</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on-leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>

            <div className="flex gap-2">
              <button 
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Clear
              </button>
              <button 
                onClick={handleExport}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || selectedDepartment !== 'all' || selectedStatus !== 'all') && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Search: "{searchTerm}"
              </span>
            )}
            {selectedDepartment !== 'all' && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                Department: {departments.find(d => d._id === selectedDepartment)?.name}
              </span>
            )}
            {selectedStatus !== 'all' && (
              <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                Status: {selectedStatus}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Employee Grid */}
      {employees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {employees.map(employee => (
            <div key={employee._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={employee.user?.avatar || `https://ui-avatars.com/api/?name=${employee.personalInfo.firstName}+${employee.personalInfo.lastName}&background=3b82f6&color=fff&size=48`}
                    alt={`${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {employee.personalInfo.firstName} {employee.personalInfo.lastName}
                    </h3>
                    <p className="text-xs text-gray-600">{employee.jobInfo.position}</p>
                    <p className="text-xs text-blue-600 font-medium">ID: {employee.employeeId}</p>
                  </div>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => toast('Employee actions menu coming soon!', { icon: '⚙️' })}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{employee.user.email}</span>
                </div>
                {employee.personalInfo.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Phone className="w-3 h-3" />
                    {employee.personalInfo.phone}
                  </div>
                )}
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Joined:</span> {formatDate(employee.jobInfo.joinDate)}
                </div>
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Salary:</span> {formatCurrency(employee.salary.baseSalary, employee.salary.currency)}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {employee.jobInfo.department?.name || 'No Department'}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(employee.status)}`}>
                  {employee.status}
                </span>
              </div>

              <div className="flex gap-1">
                <button 
                  onClick={() => toast('View employee details coming soon!', { icon: '👀' })}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  View
                </button>
                <button 
                  onClick={() => toast('Edit employee feature coming soon!', { icon: '✏️' })}
                  className="flex-1 bg-green-50 text-green-600 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteEmployee(employee._id, `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`)}
                  className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedDepartment !== 'all' || selectedStatus !== 'all'
                ? 'No employees match your current search criteria. Try adjusting your filters.' 
                : 'Get started by adding your first employee to the system.'
              }
            </p>
            {!searchTerm && selectedDepartment === 'all' && selectedStatus === 'all' && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Employee
              </button>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} employees
            </p>
            <select
              value={pagination.limit}
              onChange={(e) => setPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value={12}>12 per page</option>
              <option value={24}>24 per page</option>
              <option value={48}>48 per page</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setPagination(prev => ({ ...prev, page: 1 }));
                toast.success('Jumped to first page');
              }}
              disabled={pagination.page === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              First
            </button>
            <button
              onClick={() => {
                setPagination(prev => ({ ...prev, page: prev.page - 1 }));
                toast.success('Loading previous page...');
              }}
              disabled={pagination.page === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => {
                setPagination(prev => ({ ...prev, page: prev.page + 1 }));
                toast.success('Loading next page...');
              }}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Next
            </button>
            <button
              onClick={() => {
                setPagination(prev => ({ ...prev, page: prev.pages }));
                toast.success('Jumped to last page');
              }}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Last
            </button>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchEmployees}
      />
    </div>
  );
};

export default Employees;
