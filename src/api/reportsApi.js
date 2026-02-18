import axiosClient from "./axiosClient";

export const reportsApi = {
  getSalesStats: () => axiosClient.get("/sales/stats"),
  getMonthlyRevenue: (year) =>
    axiosClient.get("/sales/revenue/monthly", { params: { year } }),
  getTopProducts: (limit = 5) =>
    axiosClient.get("/sales/top-products", { params: { limit } }),
  getInvoiceStats: () => axiosClient.get("/invoices/stats"),
};
