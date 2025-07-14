import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Filter, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { leaveService } from '../services/leaveService'; // Adjust the import path as necessary

const Leaves: React.FC = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState<any[]>([]);
  const [balance, setBalance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await leaveService.getLeaves();
      setRequests(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await leaveService.getLeaveBalance();
      setBalance(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load leave balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'requests') fetchRequests();
    else fetchBalance();
  }, [activeTab]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending':  return 'bg-yellow-100 text-yellow-800';
      default:         return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':  return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600 mt-2">Manage employee leave requests and balances</p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          onClick={() => {/* open apply modal */}}
        >
          <Plus className="w-4 h-4" />
          Apply for Leave
        </button>
      </div>

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
          {loading && <p className="text-center py-4">Loading...</p>}
          {error && <p className="text-center py-4 text-red-600">{error}</p>}

          {activeTab === 'requests' && !loading && !error && (
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map(req => (
                      <tr key={req.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                          <img src={req.avatar} alt={req.employee} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{req.employee}</p>
                            <p className="text-xs text-gray-500">{req.department}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{format(new Date(req.startDate), 'MMM d, yyyy')} - {format(new Date(req.endDate), 'MMM d, yyyy')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.days} {req.days === 1 ? 'day' : 'days'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate">{req.reason}</td>
                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                          {getStatusIcon(req.status)}
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(req.status)}`}>{req.status}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {req.status.toLowerCase() === 'pending' && (
                            <div className="flex gap-2">
                              <button onClick={() => leaveService.approveLeave(req.id)} className="text-green-600 hover:text-green-700 font-medium">Approve</button>
                              <button onClick={() => leaveService.rejectLeave(req.id, 'Reason')} className="text-red-600 hover:text-red-700 font-medium">Reject</button>
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

          {activeTab === 'balance' && !loading && !error && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Leave Balance Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {balance.map((b, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">{b.type}</h4>
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm"><span className="text-gray-600">Total Allocated</span><span className="font-medium">{b.total} days</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-600">Used</span><span className="font-medium text-red-600">{b.used} days</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-600">Remaining</span><span className="font-medium text-green-600">{b.remaining} days</span></div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(b.used / b.total) * 100}%` }}></div>
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
