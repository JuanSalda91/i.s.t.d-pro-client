import axiosClient from "./axiosClient";

export const authApi = {
    login: (email, password) => 
        axiosClient.post('/auth/login', {email, password }),

    register: (name, email, password) =>
        axiosClient.post('/auth/register', { name, email, password },)
};