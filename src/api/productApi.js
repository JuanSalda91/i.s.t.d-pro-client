import axiosClient from './axiosClient.js';

export const productApi = {

    createProduct: (data) => axiosClient.post('/products', data),

    getProducts: (params) => axiosClient.get('/products', { params }),

    getProductById: (id) => axiosClient.get(`/products/${id}`),

    deleteProduct: (id) => axiosClient.delete(`/products/${id}`),

    updateProduct: (id, data) => axiosClient.put(`/products/${id}`, data),
};