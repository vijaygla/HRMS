import api from './api';

export const leaveService = {
  // Get leave requests
  getLeaves: async (params = {}) => {
    try {
      const response = await api.get('/leaves', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch leave requests' };
    }
  },

  // Get my leaves
  getMyLeaves: async (params = {}) => {
    try {
      const response = await api.get('/leaves/my-leaves', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch my leaves' };
    }
  },

  // Get leave balance
  getLeaveBalance: async () => {
    try {
      const response = await api.get('/leaves/my-balance');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch leave balance' };
    }
  },

  // Create leave request
  createLeave: async (leaveData) => {
    try {
      const response = await api.post('/leaves', leaveData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create leave request' };
    }
  },

  // Update leave request
  updateLeave: async (id, leaveData) => {
    try {
      const response = await api.put(`/leaves/${id}`, leaveData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update leave request' };
    }
  },

  // Approve leave
  approveLeave: async (id) => {
    try {
      const response = await api.put(`/leaves/${id}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to approve leave' };
    }
  },

  // Reject leave
  rejectLeave: async (id, rejectionReason) => {
    try {
      const response = await api.put(`/leaves/${id}/reject`, { rejectionReason });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to reject leave' };
    }
  },

  // Get leave statistics
  getLeaveStats: async () => {
    try {
      const response = await api.get('/leaves/stats/overview');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch leave stats' };
    }
  }
};