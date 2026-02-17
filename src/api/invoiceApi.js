import axiosClient from './axiosClient.js';

export const invoiceApi = {

    // create an invoice from a sale
    createinvoiceFormSale: (data) => axiosClient.post('/invoices', data),

    //get list of invoices (admin)
    getinvoices: (params) => axiosClient.get('/invoices', {params}),

    //get single invoice
    getInvoiceById: (id) => axiosClient.get(`/invoices/${id}`),

    //Download PDF
    downloadInvoicePdf: (id) =>
        axiosClient.get(`/invoices/${id}/pdf`, {
            responseType: 'blob',
        });
};