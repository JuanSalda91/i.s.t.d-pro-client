import axiosClient from './axiosClient.js';

export const productApi = {
    createProduct: (data) => axiosClient.post('/products', data),

    getProducts: (params) => 
        axiosClient.get('/products', { params }),
};