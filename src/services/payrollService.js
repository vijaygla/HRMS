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