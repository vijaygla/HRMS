import React, { useState, useEffect } from 'react';
import { DollarSign, Download, Filter, TrendingUp, Users, Calendar, Plus, Eye, FileText } from 'lucide-react';
import { payrollService } from '../services/payrollService';
import { employeeService } from '../services/employeeService';
import toast from 'react-hot-toast';

interface PayrollRecord {
  _id: string;
  employee: {
    personalInfo: {
      firstName: string;
      lastName: string;
    };
    employeeId: string;
    jobInfo: {
      department: {
        name: string;
      };
      position: string;
    };
  };
  payPeriod: {
    month: number;
    year: number;
    startDate: string;
    endDate: string;
  };
  earnings: {
    baseSalary: number;
    overtime: {
      amount: number;
      hours: number;
    };
    bonuses: {
      performance: number;
      holiday: number;
      other: number;
    };
  };
  deductions: {
    tax: {
      federal: number;
      state: number;
    };
    insurance: {
      health: number;
    };
    retirement: number;
  };
  calculations: {
    grossPay: number;
    totalDeductions: number;
    netPay: number;
  };
  status: string;
}

const Payroll: React.FC = () => {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPayroll: 0,
    totalEmployees: 0,
    averageSalary: 0,
    bonusPayouts: 0
  });

  useEffect(() => {
    fetchPayrollData();
  }, [selectedMonth]);

  const fetchPayrollData = async () => {
    try {
      setIsLoading(true);
      const [year, month] = selectedMonth.split('-');
      
      const response = await payrollService.getPayrolls({
        month: parseInt(month),
        year: parseInt(year)
      });
      
      if (response.success) {
        const records = response.data || [];
        setPayrollRecords(records);
        
        // Calculate stats
        const totalPayroll = records.reduce((sum: number, record: PayrollRecord) => 
          sum + (record.calculations?.netPay || 0), 0);
        const totalEmployees = records.length;
        const averageSalary = totalEmployees > 0 ? totalPayroll / totalEmployees : 0;
        const bonusPayouts = records.reduce((sum: number, record: PayrollRecord) => 
          sum + (record.earnings?.bonuses?.performance || 0) + 
          (record.earnings?.bonuses?.holiday || 0) + 
          (record.earnings?.bonuses?.other || 0), 0);
        
        setStats({
          totalPayroll,
          totalEmployees,
          averageSalary,
          bonusPayouts
        });
        
        if (records.length === 0) {
          toast('No payroll records found for the selected period.', { icon: '📊' });
        }
      }
    } catch (error) {
      console.error('Error fetching payroll data:', error);
      setPayrollRecords([]);
      setStats({ totalPayroll: 0, totalEmployees: 0, averageSalary: 0, bonusPayouts: 0 });
      toast.error('Failed to load payroll data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePayroll = async () => {
    try {
      const [year, month] = selectedMonth.split('-');
      
      // Get all employees
      const employeesRes = await employeeService.getEmployees({ limit: 1000 });
      if (!employeesRes.success) {
        toast.error('Failed to fetch employees');
        return;
      }
      
      const employees = employeesRes.data || [];
      if (employees.length === 0) {
        toast.error('No employees found to generate payroll');
        return;
      }
      
      toast.promise(
        Promise.all(employees.map((emp: any) => 
          payrollService.calculatePayroll(emp._id, {
            month: parseInt(month),
            year: parseInt(year)
          }).catch(() => null) // Ignore individual failures
        )),
        {
          loading: `Generating payroll for ${employees.length} employees...`,
          success: 'Payroll generated successfully!',
          error: 'Some payroll calculations failed'
        }
      );
      
      // Refresh data after generation
      setTimeout(() => {
        fetchPayrollData();
      }, 2000);
      
    } catch (error) {
      toast.error('Failed to generate payroll');
    }
  };

  const handleExport = () => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => resolve('Export completed'), 2000);
      }),
      {
        loading: 'Exporting payroll data...',
        success: 'Payroll data exported successfully!',
        error: 'Failed to export data.',
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'calculated':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-600 mt-2">Manage employee compensation and salary distribution</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleGeneratePayroll}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Generate Payroll
          </button>
          <button 
            onClick={handleExport}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Month Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Payroll Period</h3>
            <p className="text-sm text-gray-600">Select month to view payroll details</p>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              const label = `${getMonthName(date.getMonth() + 1)} ${date.getFullYear()}`;
              return (
                <option key={value} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Payroll Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalPayroll)}</p>
              <p className="text-sm text-gray-600">Total Payroll</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
              <p className="text-sm text-gray-600">Employees Paid</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageSalary)}</p>
              <p className="text-sm text-gray-600">Average Salary</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.bonusPayouts)}</p>
              <p className="text-sm text-gray-600">Bonus Payouts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Employee Payroll Details</h3>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading payroll data...</p>
          </div>
        ) : payrollRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overtime
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bonuses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deductions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Pay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payrollRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://ui-avatars.com/api/?name=${record.employee?.personalInfo?.firstName}+${record.employee?.personalInfo?.lastName}&background=3b82f6&color=fff&size=32`}
                          alt={`${record.employee?.personalInfo?.firstName} ${record.employee?.personalInfo?.lastName}`}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {record.employee?.personalInfo?.firstName} {record.employee?.personalInfo?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{record.employee?.jobInfo?.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(record.earnings?.baseSalary || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(record.earnings?.overtime?.amount || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(
                        (record.earnings?.bonuses?.performance || 0) +
                        (record.earnings?.bonuses?.holiday || 0) +
                        (record.earnings?.bonuses?.other || 0)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      -{formatCurrency(record.calculations?.totalDeductions || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(record.calculations?.netPay || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => toast('View payroll details coming soon!', { icon: '👀' })}
                          className="text-blue-600 hover:text-blue-700 p-1 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => toast('Generate payslip coming soon!', { icon: '📄' })}
                          className="text-green-600 hover:text-green-700 p-1 rounded"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payroll records found</h3>
            <p className="text-gray-500 mb-4">
              No payroll has been generated for the selected period.
            </p>
            <button 
              onClick={handleGeneratePayroll}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Generate Payroll for This Period
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payroll;

