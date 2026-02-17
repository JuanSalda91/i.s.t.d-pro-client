import axiosClient from './axiosClient.js';

/**
 * salesApi
 * 
 * Helper functions for /api/sales endpoints
 * uses axiosClient so JWT is attached automatically
 */
export const salesApi = {

    //create a new sale
    createSale: (data) => axiosClient.post('/sales', data),

    //Get all sales (from admin list later)
    getSales: (params) => axiosClient.get('/sales', { params }),

    //Get single sale by ID
    getSaleById: (id) => axiosClient.get(`/sales/:${id}`),
};