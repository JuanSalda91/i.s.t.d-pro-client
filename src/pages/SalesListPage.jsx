import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { salesApi } from '../api/salesApi.js';
import { invoiceApi } from '../api/invoiceApi.js';

/**
 * SalesListPage
 * 
 * - Show a table of sales
 * - Filter by status (pending/completed/cancelled)
 * - create invoice from a sale using POST /api/invoices
 */
