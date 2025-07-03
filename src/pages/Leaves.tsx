import React, { useState } from 'react';
import { Calendar, Plus, Filter, Clock, CheckCircle, XCircle } from 'lucide-react';

const Leaves: React.FC = () => {
  const [activeTab, setActiveTab] = useState('requests');

  const leaveRequests = [
    {
      id: 1,
      employee: 'Emma Wilson',
      avatar: 'https://images.pexels.com/photos/3823495/pexels-photo-3823495.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
      department: 'Marketing',
      type: 'Annual Leave',
      startDate: '2024-01-15',
      endDate: '2024-01-19',
      days: 5,
      reason: 'Family vacation',
      status: 'Pending',
      appliedDate: '2024-01-05'
    },
    {
      id: 2,
      employee: 'Michael Chen',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
      department: 'Sales',
      type: 'Sick Leave',
      startDate: '2024-01-12',
      endDate: '2024-01-12',
      days: 1,
      reason: 'Medical appointment',
      status: 'Approved',
      appliedDate: '2024-01-10'
    },
    {
      id: 3,
      employee: 'Sarah Johnson',
      avatar: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
      department: 'Engineering',
      type: 'Personal Leave',
      startDate: '2024-01-20',
      endDate: '2024-01-22',
      days: 3,
      reason: 'Personal matters',
      status: 'Rejected',
      appliedDate: '2024-01-08'
    }
  ];

  const leaveBalance = [
    { type: 'Annual Leave', total: 25, used: 8, remaining: 17 },
    { type: 'Sick Leave', total: 10, used: 2, remaining: 8 },
    { type: 'Personal Leave', total: 5, used: 1, remaining: 4 },
    { type: 'Maternity/Paternity', total: 90, used: 0, remaining: 90 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'Pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600 mt-2">Manage employee leave requests and balances</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Apply for Leave
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Leave Requests
            </button>
            <button
              onClick={() => setActiveTab('balance')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'balance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Leave Balance
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Recent Leave Requests</h3>
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Leave Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Days
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
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
                    {leaveRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img
                              src={request.avatar}
                              alt={request.employee}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{request.employee}</p>
                              <p className="text-xs text-gray-500">{request.department}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.startDate} to {request.endDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.days} {request.days === 1 ? 'day' : 'days'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate">
                          {request.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.status)}
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.status === 'Pending' && (
                            <div className="flex gap-2">
                              <button className="text-green-600 hover:text-green-700 font-medium">
                                Approve
                              </button>
                              <button className="text-red-600 hover:text-red-700 font-medium">
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'balance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Leave Balance Overview</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {leaveBalance.map((balance, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">{balance.type}</h4>
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Allocated</span>
                        <span className="font-medium">{balance.total} days</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Used</span>
                        <span className="font-medium text-red-600">{balance.used} days</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Remaining</span>
                        <span className="font-medium text-green-600">{balance.remaining} days</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(balance.used / balance.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaves;