import api from './api';

export const attendanceService = {
  // Get attendance records
  getAttendance: async (params = {}) => {
    try {
      const response = await api.get('/attendance', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch attendance' };
    }
  },

  // Get my attendance
  getMyAttendance: async (params = {}) => {
    try {
      const response = await api.get('/attendance/my-attendance', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch my attendance' };
    }
  },

  // Check in
  checkIn: async (data = {}) => {
    try {
      const response = await api.post('/attendance/check-in', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Check-in failed' };
    }
  },

  // Check out
  checkOut: async (data = {}) => {
    try {
      const response = await api.post('/attendance/check-out', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Check-out failed' };
    }
  },

  // Get attendance statistics
  getAttendanceStats: async () => {
    try {
      const response = await api.get('/attendance/stats/overview');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch attendance stats' };
    }
  },

  // Create attendance record
  createAttendance: async (attendanceData) => {
    try {
      const response = await api.post('/attendance', attendanceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create attendance record' };
    }
  },

  // Update attendance record
  updateAttendance: async (id, attendanceData) => {
    try {
      const response = await api.put(`/attendance/${id}`, attendanceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update attendance record' };
    }
  },

  // Delete attendance record
  deleteAttendance: async (id) => {
    try {
      const response = await api.delete(`/attendance/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete attendance record' };
    }
  },

  // Get attendance report
  getAttendanceReport: async (params = {}) => {
    try {
      const response = await api.get('/attendance/reports/export', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to generate attendance report' };
    }
  }
};

