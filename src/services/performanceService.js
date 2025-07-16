import api from './api';

export const performanceService = {
  // Get performance reviews
  getPerformanceReviews: async (params = {}) => {
    try {
      const response = await api.get('/performance', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch performance reviews' };
    }
  },

  // Get my performance reviews
  getMyPerformanceReviews: async (params = {}) => {
    try {
      const response = await api.get('/performance/my-reviews', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch my performance reviews' };
    }
  },

  // Get single performance review
  getPerformanceReview: async (id) => {
    try {
      const response = await api.get(`/performance/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch performance review' };
    }
  },

  // Create performance review
  createPerformanceReview: async (reviewData) => {
    try {
      const response = await api.post('/performance', reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create performance review' };
    }
  },

  // Update performance review
  updatePerformanceReview: async (id, reviewData) => {
    try {
      const response = await api.put(`/performance/${id}`, reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update performance review' };
    }
  },

  // Delete performance review
  deletePerformanceReview: async (id) => {
    try {
      const response = await api.delete(`/performance/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete performance review' };
    }
  },

  // Submit review
  submitReview: async (id) => {
    try {
      const response = await api.put(`/performance/${id}/submit`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to submit review' };
    }
  },

  // Acknowledge review
  acknowledgeReview: async (id, comments) => {
    try {
      const response = await api.put(`/performance/${id}/acknowledge`, { employeeComments: comments });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to acknowledge review' };
    }
  },

  // Get performance statistics
  getPerformanceStats: async () => {
    try {
      const response = await api.get('/performance/stats/overview');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch performance stats' };
    }
  }
};

