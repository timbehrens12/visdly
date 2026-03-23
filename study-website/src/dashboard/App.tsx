import { Routes, Route, Navigate } from 'react-router-dom';
import { SidebarProvider } from './contexts/SidebarContext';
import { MainLayout } from './components/MainLayout';
import { DashboardOverview } from './pages/DashboardOverview';
import { CombinedProvider } from './contexts/CombinedContext';
import { ProfileProvider } from './contexts/ProfileContext';

import './index.css';

export default function App() {
  return (
    <div className="dashboard-theme">
      <CombinedProvider>
        <SidebarProvider>
          <Routes>
            <Route path="/" element={
              <MainLayout>
                <DashboardOverview />
              </MainLayout>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SidebarProvider>
      </CombinedProvider>
    </div>
  );
}
