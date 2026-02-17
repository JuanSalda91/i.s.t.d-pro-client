import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductForm from "./pages/ProductForm.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ProductsListPage from "./pages/ProductsListPage.jsx";
import ProductEditPage from "./pages/ProductEditPage.jsx";
import SalesCreatePage from "./pages/SalesCreatePage.jsx";
import SalesListPage from "./pages/SalesListPage.jsx";
import InvoicesListPage from "./pages/InvoicesListPage.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />

          {/*Register Route */}
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />

            {/* Register Products Route */}
            <Route path="/products/new" element={<ProductForm />} />

            {/* Product List */}
            <Route path="/products" element={<ProductsListPage />} />

            {/* Edit Products */}
            <Route path="/products/edit/:id" element={<ProductEditPage />} />

            {/* Sales */}
            <Route path="/sales" element={<SalesListPage />} />
            <Route path="/sales/new" element={<SalesCreatePage />} />

            {/* Invoices */}
            <Route path="/invoices" element={<InvoicesListPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);
