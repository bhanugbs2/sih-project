import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { HivesPage } from './pages/HivesPage';
import { HiveDetailPage } from './pages/HiveDetailPage';
import { AlertsPage } from './pages/AlertsPage';
import { BatchesPage } from './pages/BatchesPage';
import { BatchDetailPage } from './pages/BatchDetailPage';
import { QualityPage } from './pages/QualityPage';
import { ProcessingPage } from './pages/ProcessingPage';
import { PackagesPage } from './pages/PackagesPage';
import { TraceabilityPage } from './pages/TraceabilityPage';
import { FarmsPage } from './pages/FarmsPage';
import { UsersPage } from './pages/UsersPage';
import { VerifyPage } from './pages/VerifyPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/verify/:packageId" element={<VerifyPage />} />

          {/* Protected Routes inside Main Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="hives" element={<HivesPage />} />
            <Route path="hives/:hiveId" element={<HiveDetailPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="batches" element={<BatchesPage />} />
            <Route path="batches/:batchId" element={<BatchDetailPage />} />
            <Route path="quality" element={<QualityPage />} />
            <Route path="processing" element={<ProcessingPage />} />
            <Route path="packages" element={<PackagesPage />} />
            <Route path="traceability" element={<TraceabilityPage />} />
            <Route path="farms" element={<FarmsPage />} />
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
