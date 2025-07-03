import api from './api';

export const departmentService = {
  // Get all departments
  getDepartments: async () => {
    try {
      const response = await api.get('/departments');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch departments' };
    }
  },

  // Get single department
  getDepartment: async (id) => {
    try {
      const response = await api.get(`/departments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch department' };
    }
  },

  // Create department
  createDepartment: async (departmentData) => {
    try {
      const response = await api.post('/departments', departmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create department' };
    }
  },

  // Update department
  updateDepartment: async (id, departmentData) => {
    try {
      const response = await api.put(`/departments/${id}`, departmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update department' };
    }
  },

  // Delete department
  deleteDepartment: async (id) => {
    try {
      const response = await api.delete(`/departments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete department' };
    }
  },

  // Get department statistics
  getDepartmentStats: async (id) => {
    try {
      const response = await api.get(`/departments/${id}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch department stats' };
    }
  }
};