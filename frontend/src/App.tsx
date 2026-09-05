import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlannerProvider } from './context/PlannerContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/Calendar';
import DailyPlanner from './pages/DailyPlanner';
import Stats from './pages/Stats';
import Profiles from './pages/Profiles';
import PlanBuilder from './pages/PlanBuilder';
import AuthPage from './pages/AuthPage';

function AppInner() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <PlannerProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="day/:date" element={<DailyPlanner />} />
            <Route path="stats" element={<Stats />} />
            <Route path="profiles" element={<Profiles />} />
            <Route path="plan-builder" element={<PlanBuilder />} />
          </Route>
        </Routes>
      </HashRouter>
    </PlannerProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
