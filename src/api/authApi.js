import axiosClient from "./axiosClient";

export const authApi = {
  login: (email, password) =>
    axiosClient.post("/auth/login", { email, password }),

  register: (data) => axiosClient.post("/auth/register", data),
};
