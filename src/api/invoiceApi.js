import axiosClient from "./axiosClient.js";

export const invoiceApi = {
  // Create an invoice from a sale
  createInvoiceFromSale: (data) => axiosClient.post("/invoices", data),

  // Get list of invoices (admin)
  getInvoices: (params) => axiosClient.get("/invoices", { params }),

  // Get single invoice
  getInvoiceById: (id) => axiosClient.get(`/invoices/${id}`),

  // Download PDF
  downloadInvoicePdf: (id) =>
    axiosClient.get(`/invoices/${id}/pdf`, {
      responseType: "blob",
    }),

  //Update invoices
  updateInvoice: (id, data) => axiosClient.put(`/invoices/${id}`, data),
};
