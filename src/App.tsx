import { Suspense } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';

import Navbar from './components/shared/Navbar';
import { ToastProvider } from './components/shared/toast';
import ErrorBoundary from './components/shared/ErrorBoundary/ErrorBoundary';
import Spinner from './components/shared/spinner/Spinner';
import Calculator from './components/Calculator';
import BasicLoanCalculations from './components/calculations/BasicLoanCalculations';
import MainClaimCalculations from './components/calculations/MainClaimCalculations';
import FirstClaimCalculations from './components/calculations/FirstClaimCalculations';
import SecondClaimCalculations from './components/calculations/SecondClaimCalculations';
import { Summary } from './components/claims/Summary';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-100">
          <Navbar />
          <main className="flex-grow container mx-auto p-4">
            <ErrorBoundary>
              <Suspense fallback={<Spinner />}>
                <Routes>
                  <Route path="/" element={<Calculator />} />
                  <Route path="/basic-calculations" element={<BasicLoanCalculations />} />
                  <Route path="/main-claim" element={<MainClaimCalculations />} />
                  <Route path="/first-claim" element={<FirstClaimCalculations />} />
                  <Route path="/second-claim" element={<SecondClaimCalculations />} />
                  <Route path="/summary" element={<Summary />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </Router>
    </ToastProvider>
  );
};

export default App;
