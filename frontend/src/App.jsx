import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { HospitalProvider } from './context/HospitalContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { AlertToast } from './components/common/AlertToast';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AITriagePage } from './pages/AITriagePage';
import { BedManagementPage } from './pages/BedManagementPage';
import { StaffPortalPage } from './pages/StaffPortalPage';

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-hospital-darkest flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-950/40">
          {children}
        </main>
      </div>
      <AlertToast />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <HospitalProvider>
            <Routes>
              {/* Public Staff Login Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Clinical Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <DashboardPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/triage"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <AITriagePage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/beds"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <BedManagementPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/portal"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <StaffPortalPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HospitalProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
