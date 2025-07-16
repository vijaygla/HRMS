import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Filter, Clock, CheckCircle, XCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { leaveService } from '../services/leaveService';
import toast from 'react-hot-toast';

interface LeaveRequest {
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
    };
  };
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  appliedDate: string;
  approvedBy?: {
    personalInfo: {
      firstName: string;
      lastName: string;
    };
  };
  approvedDate?: string;
  rejectionReason?: string;
}

interface LeaveBalance {
  leaveType: string;
  allocated: number;
  used: number;
  remaining: number;
}

const Leaves: React.FC = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchLeaveRequests();
    } else {
      fetchLeaveBalance();
    }
  }, [activeTab, selectedStatus, selectedType]);

  const fetchLeaveRequests = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      
      if (selectedType !== 'all') {
        params.leaveType = selectedType;
      }

      const response = await leaveService.getLeaves(params);
      
      if (response.success) {
        setLeaveRequests(response.data || []);
        
        if (response.data?.length === 0) {
          toast('No leave requests found.', { icon: '📋' });
        }
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      setLeaveRequests([]);
      toast.error('Failed to load leave requests.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      setIsLoading(true);
      const response = await leaveService.getLeaveBalance();
      
      if (response.success) {
        setLeaveBalance(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching leave balance:', error);
      setLeaveBalance([]);
      toast.error('Failed to load leave balance.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId: string, employeeName: string) => {
    try {
      const response = await leaveService.approveLeave(leaveId);
      if (response.success) {
        toast.success(`Leave request for ${employeeName} approved successfully!`);
        fetchLeaveRequests();
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to approve leave request';
      toast.error(errorMessage);
    }
  };

  const handleRejectLeave = async (leaveId: string, employeeName: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const response = await leaveService.rejectLeave(leaveId, reason);
      if (response.success) {
        toast.success(`Leave request for ${employeeName} rejected.`);
        fetchLeaveRequests();
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to reject leave request';
      toast.error(errorMessage);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLeaveTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      annual: 'bg-blue-100 text-blue-800',
      sick: 'bg-red-100 text-red-800',
      personal: 'bg-purple-100 text-purple-800',
      maternity: 'bg-pink-100 text-pink-800',
      paternity: 'bg-indigo-100 text-indigo-800',
      emergency: 'bg-orange-100 text-orange-800',
      unpaid: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600 mt-2">Manage employee leave requests and balances</p>
        </div>
        <button 
          onClick={() => toast('Apply for leave feature coming soon!', { icon: '📝' })}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
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
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Leave Requests
            </button>
            <button
              onClick={() => setActiveTab('balance')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
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
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal Leave</option>
                  <option value="maternity">Maternity Leave</option>
                  <option value="paternity">Paternity Leave</option>
                  <option value="emergency">Emergency Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>

                <button 
                  onClick={() => {
                    setSelectedStatus('all');
                    setSelectedType('all');
                    toast.success('Filters cleared');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading leave requests...</p>
                </div>
              ) : leaveRequests.length > 0 ? (
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
                        <tr key={request._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img
                                src={`https://ui-avatars.com/api/?name=${request.employee.personalInfo.firstName}+${request.employee.personalInfo.lastName}&background=3b82f6&color=fff&size=32`}
                                alt={`${request.employee.personalInfo.firstName} ${request.employee.personalInfo.lastName}`}
                                className="w-8 h-8 rounded-full"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {request.employee.personalInfo.firstName} {request.employee.personalInfo.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {request.employee.jobInfo.department?.name || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getLeaveTypeColor(request.leaveType)}`}>
                              {request.leaveType.replace('-', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(request.startDate)} to {formatDate(request.endDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {request.totalDays} {request.totalDays === 1 ? 'day' : 'days'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate">
                            {request.reason}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(request.status)}
                              <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(request.status)}`}>
                                {request.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => toast('View leave details coming soon!', { icon: '👀' })}
                                className="text-blue-600 hover:text-blue-700 p-1 rounded"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {request.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => handleApproveLeave(request._id, `${request.employee.personalInfo.firstName} ${request.employee.personalInfo.lastName}`)}
                                    className="text-green-600 hover:text-green-700 p-1 rounded"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleRejectLeave(request._id, `${request.employee.personalInfo.firstName} ${request.employee.personalInfo.lastName}`)}
                                    className="text-red-600 hover:text-red-700 p-1 rounded"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button 
                                onClick={() => toast('Edit leave request coming soon!', { icon: '✏️' })}
                                className="text-gray-600 hover:text-gray-700 p-1 rounded"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests found</h3>
                  <p className="text-gray-500">
                    {selectedStatus !== 'all' || selectedType !== 'all'
                      ? 'No leave requests match your current filters.'
                      : 'No leave requests have been submitted yet.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'balance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Leave Balance Overview</h3>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading leave balance...</p>
                </div>
              ) : leaveBalance.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {leaveBalance.map((balance, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900 capitalize">
                          {balance.leaveType.replace('-', ' ')} Leave
                        </h4>
                        <Calendar className="w-5 h-5 text-gray-400" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Allocated</span>
                          <span className="font-medium">{balance.allocated} days</span>
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
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${balance.allocated > 0 ? (balance.used / balance.allocated) * 100 : 0}%` }}
                          ></div>
                        </div>
                        
                        <div className="text-xs text-gray-500 text-center">
                          {balance.allocated > 0 ? Math.round((balance.used / balance.allocated) * 100) : 0}% used
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No leave balance data</h3>
                  <p className="text-gray-500">Leave balance information will appear here once configured.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaves;

