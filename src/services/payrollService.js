import api from './api';

export const payrollService = {
  // Get payroll records
  getPayrolls: async (params = {}) => {
    try {
      const response = await api.get('/payroll', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch payroll records' };
    }
  },

  // Get my payroll
  getMyPayroll: async (params = {}) => {
    try {
      const response = await api.get('/payroll/my-payroll', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch my payroll' };
    }
  },

  // Get single payroll record
  getPayroll: async (id) => {
    try {
      const response = await api.get(`/payroll/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch payroll record' };
    }
  },

  // Create payroll record
  createPayroll: async (payrollData) => {
    try {
      const response = await api.post('/payroll', payrollData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create payroll record' };
    }
  },

  // Update payroll record
  updatePayroll: async (id, payrollData) => {
    try {
      const response = await api.put(`/payroll/${id}`, payrollData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update payroll record' };
    }
  },

  // Delete payroll record
  deletePayroll: async (id) => {
    try {
      const response = await api.delete(`/payroll/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete payroll record' };
    }
  },

  // Calculate payroll
  calculatePayroll: async (employeeId, data) => {
    try {
      const response = await api.post(`/payroll/calculate/${employeeId}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to calculate payroll' };
    }
  },

  // Approve payroll
  approvePayroll: async (id) => {
    try {
      const response = await api.put(`/payroll/${id}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to approve payroll' };
    }
  },

  // Generate payslip
  generatePayslip: async (id) => {
    try {
      const response = await api.get(`/payroll/${id}/payslip`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to generate payslip' };
    }
  },

  // Get payroll statistics
  getPayrollStats: async () => {
    try {
      const response = await api.get('/payroll/stats/overview');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch payroll stats' };
    }
  }
};

