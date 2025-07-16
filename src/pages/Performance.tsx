import React, { useState, useEffect } from 'react';
import { TrendingUp, Star, Target, Award, Plus, Eye, Edit, CheckCircle } from 'lucide-react';
import { performanceService } from '../services/performanceService';
import { employeeService } from '../services/employeeService';
import toast from 'react-hot-toast';

interface PerformanceReview {
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
  reviewer: {
    personalInfo: {
      firstName: string;
      lastName: string;
    };
  };
  reviewPeriod: {
    type: string;
    startDate: string;
    endDate: string;
  };
  overallRating: number;
  goals: Array<{
    title: string;
    status: string;
    achievement: number;
  }>;
  status: string;
  createdAt: string;
  submittedDate?: string;
  acknowledgedDate?: string;
}

const Performance: React.FC = () => {
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [stats, setStats] = useState({
    averageRating: 0,
    goalCompletion: 0,
    performanceGrowth: 0,
    topPerformers: 0
  });

  useEffect(() => {
    fetchPerformanceData();
  }, [selectedType, selectedStatus]);

  const fetchPerformanceData = async () => {
    try {
      setIsLoading(true);
      
      const params: any = {};
      if (selectedType !== 'all') params.type = selectedType;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      
      const response = await performanceService.getPerformanceReviews(params);
      
      if (response.success) {
        const reviews = response.data || [];
        setPerformanceReviews(reviews);
        
        // Calculate stats
        if (reviews.length > 0) {
          const totalRating = reviews.reduce((sum: number, review: PerformanceReview) => 
            sum + (review.overallRating || 0), 0);
          const averageRating = totalRating / reviews.length;
          
          const totalGoals = reviews.reduce((sum: number, review: PerformanceReview) => 
            sum + (review.goals?.length || 0), 0);
          const completedGoals = reviews.reduce((sum: number, review: PerformanceReview) => 
            sum + (review.goals?.filter(goal => goal.status === 'completed').length || 0), 0);
          const goalCompletion = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
          
          const topPerformers = reviews.filter((review: PerformanceReview) => 
            review.overallRating >= 4.5).length;
          
          setStats({
            averageRating: Math.round(averageRating * 10) / 10,
            goalCompletion: Math.round(goalCompletion),
            performanceGrowth: 15, // This would be calculated based on historical data
            topPerformers
          });
        } else {
          setStats({
            averageRating: 0,
            goalCompletion: 0,
            performanceGrowth: 0,
            topPerformers: 0
          });
        }
        
        if (reviews.length === 0) {
          toast('No performance reviews found.', { icon: '📊' });
        }
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      setPerformanceReviews([]);
      setStats({ averageRating: 0, goalCompletion: 0, performanceGrowth: 0, topPerformers: 0 });
      toast.error('Failed to load performance data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReview = async () => {
    try {
      // Get all employees to create reviews for
      const employeesRes = await employeeService.getEmployees({ limit: 1000 });
      if (!employeesRes.success) {
        toast.error('Failed to fetch employees');
        return;
      }
      
      const employees = employeesRes.data || [];
      if (employees.length === 0) {
        toast.error('No employees found to create reviews for');
        return;
      }
      
      toast('Create performance review feature coming soon!', { icon: '📝' });
    } catch (error) {
      toast.error('Failed to create performance review');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'acknowledged':
        return 'bg-blue-100 text-blue-800';
      case 'in-review':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance</h1>
          <p className="text-gray-600 mt-2">Track and manage employee performance reviews</p>
        </div>
        <button 
          onClick={handleCreateReview}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Review
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Review Types</option>
            <option value="quarterly">Quarterly</option>
            <option value="semi-annual">Semi-Annual</option>
            <option value="annual">Annual</option>
            <option value="probation">Probation</option>
            <option value="project-based">Project-Based</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="in-review">In Review</option>
            <option value="completed">Completed</option>
            <option value="acknowledged">Acknowledged</option>
          </select>

          <button 
            onClick={() => {
              setSelectedType('all');
              setSelectedStatus('all');
              toast.success('Filters cleared');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
              <p className="text-sm text-gray-600">Avg Rating</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.goalCompletion}%</p>
              <p className="text-sm text-gray-600">Goal Completion</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.performanceGrowth}%</p>
              <p className="text-sm text-gray-600">Performance Growth</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.topPerformers}</p>
              <p className="text-sm text-gray-600">Top Performers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Employee Performance Overview</h3>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading performance data...</p>
          </div>
        ) : performanceReviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Goals Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
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
                {performanceReviews.map((record) => {
                  const completedGoals = record.goals?.filter(goal => goal.status === 'completed').length || 0;
                  const totalGoals = record.goals?.length || 0;
                  const goalProgress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
                  
                  return (
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                          {record.reviewPeriod?.type?.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {renderStars(record.overallRating || 0)}
                          </div>
                          <span className={`text-sm font-medium ${getRatingColor(record.overallRating || 0)}`}>
                            {record.overallRating || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${goalProgress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {completedGoals}/{totalGoals}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(record.reviewPeriod?.startDate)} - {formatDate(record.reviewPeriod?.endDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(record.status)}`}>
                          {record.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => toast('View review details coming soon!', { icon: '👀' })}
                            className="text-blue-600 hover:text-blue-700 p-1 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => toast('Edit review coming soon!', { icon: '✏️' })}
                            className="text-green-600 hover:text-green-700 p-1 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {record.status === 'completed' && (
                            <button 
                              onClick={() => toast('Acknowledge review coming soon!', { icon: '✅' })}
                              className="text-purple-600 hover:text-purple-700 p-1 rounded"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No performance reviews found</h3>
            <p className="text-gray-500 mb-4">
              {selectedType !== 'all' || selectedStatus !== 'all'
                ? 'No performance reviews match your current filters.'
                : 'No performance reviews have been created yet.'
              }
            </p>
            <button 
              onClick={handleCreateReview}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Performance Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Performance;

