import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { HivesPage } from './pages/HivesPage';
import { BatchesPage } from './pages/BatchesPage';
import { QualityPage } from './pages/QualityPage';
import { ProcessingPage } from './pages/ProcessingPage';
import { PackagesPage } from './pages/PackagesPage';
import { BlockchainPage } from './pages/BlockchainPage';
import { VerifyPage } from './pages/VerifyPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/hives" element={<HivesPage />} />
        <Route path="/batches" element={<BatchesPage />} />
        <Route path="/quality" element={<QualityPage />} />
        <Route path="/processing" element={<ProcessingPage />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/blockchain" element={<BlockchainPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
