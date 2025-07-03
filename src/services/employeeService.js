import api from './api';

export const employeeService = {
  // Get all employees
  getEmployees: async (params = {}) => {
    try {
      const response = await api.get('/employees', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch employees' };
    }
  },

  // Get single employee
  getEmployee: async (id) => {
    try {
      const response = await api.get(`/employees/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch employee' };
    }
  },

  // Create employee
  createEmployee: async (employeeData) => {
    try {
      const response = await api.post('/employees', employeeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create employee' };
    }
  },

  // Update employee
  updateEmployee: async (id, employeeData) => {
    try {
      const response = await api.put(`/employees/${id}`, employeeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update employee' };
    }
  },

  // Delete employee
  deleteEmployee: async (id) => {
    try {
      const response = await api.delete(`/employees/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete employee' };
    }
  },

  // Get employees by department
  getEmployeesByDepartment: async (departmentId) => {
    try {
      const response = await api.get(`/employees/department/${departmentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch employees by department' };
    }
  }
};