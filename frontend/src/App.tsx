import { BrowserRouter, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppLayout } from "@/layouts/AppLayout";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { MyWarrantiesPage } from "@/pages/MyWarrantiesPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ProductDetailsPage } from "@/pages/ProductDetailsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RegisterProductPage } from "@/pages/RegisterProductPage";
import { TransferOwnershipPage } from "@/pages/TransferOwnershipPage";
import { VerifyPage } from "@/pages/VerifyPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="verify" element={<VerifyPage />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="register-product"
            element={
              <ProtectedRoute>
                <RegisterProductPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="warranties"
            element={
              <ProtectedRoute>
                <MyWarrantiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="products/:productId"
            element={
              <ProtectedRoute>
                <ProductDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="products/:productId/transfer"
            element={
              <ProtectedRoute>
                <TransferOwnershipPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
