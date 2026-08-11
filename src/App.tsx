import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import DefineMandate from './pages/DefineMandate';
import ResearchStrategy from './pages/ResearchStrategy';
import CompanyDiscovery from './pages/CompanyDiscovery';
import ReviewResults from './pages/ReviewResults';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Default path redirect to step 1 */}
          <Route path="/" element={<Navigate to="/mandate" replace />} />
          
          {/* Main steps routes */}
          <Route path="/mandate" element={<DefineMandate />} />
          <Route path="/research" element={<ResearchStrategy />} />
          <Route path="/discover" element={<CompanyDiscovery />} />
          <Route path="/review" element={<ReviewResults />} />
          
          {/* Fallback 404 Route */}
          <Route path="*" element={<Navigate to="/mandate" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
