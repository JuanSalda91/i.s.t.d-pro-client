import axiosClient from "./axiosClient";

/**
 * dashboardApi
 * 
 * Small helper for endpoints used on the dashboard
 * Uses axiosclient, so JWT is handled automatically
 */
export const dashboardApi = {
    //GET /api/sales/revenue/monthly?year=yyy
    getMonthlyRevenue: (year) => 
        axiosClient.get('/sales/revenue/monthly', {
            params: { year },
        }),

        // GET /api/invoices/stats
        getInvoiceStats: () => axiosClient.get('/invoices/stats'),

        // GET /api/products/low-stock?threshold=5
        getLowStock: (threshold = 5) =>
            axiosClient.get('/products/low-stock', {
                params: { threshold },
            }),
};