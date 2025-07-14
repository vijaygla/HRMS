import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreVertical,
  Mail,
  Phone,
  Trash2,
  Edit,
} from 'lucide-react';
import { employeeService } from '../services/employeeService';
import { departmentService } from '../services/departmentService';
import toast from 'react-hot-toast';
import AddEmployeeModal from '../components/AddEmployeeModal';

interface Employee {
  _id: string;
  personalInfo: { firstName: string; lastName: string };
  user: { email: string; avatar?: string };
  jobInfo: { position: string; department: { name: string } };
  phone?: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  /* -------------------------- data fetching ------------------------- */
  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedDepartment, pagination.page]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const params: any = { page: pagination.page, limit: pagination.limit };
      if (searchTerm) params.search = searchTerm;
      if (selectedDepartment !== 'all') params.department = selectedDepartment;

      const res = await employeeService.getEmployees(params);
      if (res.success) {
        setEmployees(res.data || []);
        setPagination((p) => ({
          ...p,
          total: res.total || 0,
          pages: res.pagination?.pages || 0,
        }));
        if (res.data?.length === 0 && searchTerm) {
          toast('No employees found matching your search criteria.', { icon: '🔍' });
        }
      }
    } catch {
      setEmployees([]);
      toast.error('Failed to load employees. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.getDepartments();
      if (res.success) setDepartments(res.data || []);
    } catch {
      toast.error('Failed to load departments.');
    }
  };

  /* --------------------------- utilities ---------------------------- */
  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}? This action cannot be undone.`)) return;
    try {
      const res = await employeeService.deleteEmployee(id);
      if (res.success) {
        toast.success(`${name} has been deleted.`);
        fetchEmployees();
      }
    } catch {
      toast.error('Failed to delete employee.');
    }
  };

  const handleExport = () =>
    toast.promise(
      new Promise((r) => setTimeout(() => r('done'), 2000)),
      {
        loading: 'Exporting employee data…',
        success: 'Employee data exported!',
        error: 'Export failed.',
      },
    );

  const getStatusColor = (s: string) =>
    ({
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      'on-leave': 'bg-orange-100 text-orange-800',
      terminated: 'bg-red-100 text-red-800',
    }[s] || 'bg-gray-100 text-gray-800');

  /* ------------------------------- UI ------------------------------- */
  if (isLoading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading employees…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-2">Manage your organization&apos;s workforce</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => toast('Filter feature coming soon!', { icon: '🔧' })}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filter
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

      {/* employee grid */}
      {employees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((emp) => (
            <div
              key={emp._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      emp.user.avatar ||
                      'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
                    }
                    alt={`${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {emp.personalInfo.firstName} {emp.personalInfo.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{emp.jobInfo.position}</p>
                  </div>
                </div>

                <button
                  onClick={() => toast('Employee actions menu coming soon!', { icon: '⚙️' })}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  {emp.user.email}
                </div>
                {emp.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    {emp.phone}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {emp.jobInfo.department?.name || 'No Department'}
                </span>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(
                    emp.status,
                  )}`}
                >
                  {emp.status}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toast('Edit employee feature coming soon!', { icon: '✏️' })}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() =>
                    handleDeleteEmployee(
                      emp._id,
                      `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`,
                    )
                  }
                  className="flex-1 bg-red-50 text-red-600 py-2 px-4 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* empty‑state */
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedDepartment !== 'all'
                ? 'No employees match your current search criteria. Try adjusting your filters.'
                : 'Get started by adding your first employee to the system.'}
            </p>
            {!searchTerm && selectedDepartment === 'all' && (
              <button
                onClick={() => setIsAddOpen(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Employee
              </button>
            )}
          </div>
        </div>
      )}

      {/* pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-700">
            Showing {pagination.limit * (pagination.page - 1) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
            results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setPagination((p) => ({
                  ...p,
                  page: Math.max(1, p.page - 1),
                }))
              }
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() =>
                setPagination((p) => ({
                  ...p,
                  page: Math.min(p.pages, p.page + 1),
                }))
              }
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* modal */}
      <AddEmployeeModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={fetchEmployees} />
    </div>
  );
};

export default Employees;
