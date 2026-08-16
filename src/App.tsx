import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import DefineMandate from './pages/DefineMandate';
import CompanyDiscovery from './pages/CompanyDiscovery';
import DiscoverFounders from './pages/DiscoverFounders';
import ReviewResults from './pages/ReviewResults';
import Outreach from './pages/Outreach';
import { MandateHistoryProvider } from './context/MandateHistoryContext';

function App() {
  return (
    <MandateHistoryProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            {/* Default path redirect to step 1 */}
            <Route path="/" element={<Navigate to="/mandate" replace />} />
            
            {/* Main steps routes */}
            <Route path="/mandate" element={<DefineMandate />} />
            <Route path="/research" element={<Navigate to="/discover" replace />} />
            <Route path="/discover" element={<CompanyDiscovery />} />
            <Route path="/founders" element={<DiscoverFounders />} />
            <Route path="/review" element={<ReviewResults />} />
            <Route path="/outreach" element={<Outreach />} />
            
            {/* Fallback 404 Route */}
            <Route path="*" element={<Navigate to="/mandate" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MandateHistoryProvider>
  );
}

export default App;
