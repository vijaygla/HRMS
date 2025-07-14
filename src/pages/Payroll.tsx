import React, { useState, useEffect } from 'react';
import { DollarSign, Download, Filter, Calendar } from 'lucide-react';

interface PayrollSummary {
  totalPayroll: string;
  totalEmployees: number;
  averageSalary: string;
  bonusPayouts: string;
}

interface PayrollRecord {
  id: number;
  employee: string;
  avatar: string;
  position: string;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  netPay: number;
  status: string;
}

const Payroll: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [payrollSummary, setPayrollSummary] = useState<PayrollSummary | null>(null);
  const [payrollData, setPayrollData] = useState<PayrollRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPayroll = async () => {
      setIsLoading(true);
      try {
        // Replace with your real API endpoints
        const summaryRes = await fetch(`/api/payroll/summary?month=${selectedMonth}`);
        const dataRes = await fetch(`/api/payroll/data?month=${selectedMonth}`);

        if (!summaryRes.ok || !dataRes.ok) {
          throw new Error('Failed to fetch payroll information');
        }

        const summary: PayrollSummary = await summaryRes.json();
        const data: PayrollRecord[] = await dataRes.json();

        setPayrollSummary(summary);
        setPayrollData(data);
      } catch (error) {
        console.error('Error fetching payroll:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayroll();
  }, [selectedMonth]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  if (isLoading) {
    return <div>Loading payroll data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-600 mt-2">Manage employee compensation and salary distribution</p>
        </div>
        <div className="flex gap-3">
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
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
            {/* Populate options dynamically or keep static list */}
            <option value="2024-01">January 2024</option>
            <option value="2023-12">December 2023</option>
            <option value="2023-11">November 2023</option>
            <option value="2023-10">October 2023</option>
          </select>
        </div>
      </div>

      {/* Payroll Summary */}
      {payrollSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{payrollSummary.totalPayroll}</p>
              <p className="text-sm text-gray-600">Total Payroll</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{payrollSummary.totalEmployees}</p>
              <p className="text-sm text-gray-600">Employees Paid</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{payrollSummary.averageSalary}</p>
              <p className="text-sm text-gray-600">Average Salary</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{payrollSummary.bonusPayouts}</p>
              <p className="text-sm text-gray-600">Bonus Payouts</p>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Employee Payroll Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {/* table headers */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payrollData.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  {/* table cells rendering record */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payroll;
