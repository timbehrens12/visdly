import { Routes, Route, Navigate } from 'react-router-dom';
import { SidebarProvider } from './contexts/SidebarContext';
import { MainLayout } from './components/MainLayout';
import { DashboardOverview } from './pages/DashboardOverview';
import { CombinedProvider } from './contexts/CombinedContext';
import { ProfileProvider } from './contexts/ProfileContext';

export default function App() {
  return (
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
  );
}
