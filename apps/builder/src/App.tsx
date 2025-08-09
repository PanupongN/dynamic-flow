
import { Routes, Route, useLocation } from 'react-router-dom';
import { FlowBuilder } from './pages/FlowBuilder';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { FormView } from './pages/FormView';


import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';
import { CountryDetectionDebug } from './components/CountryDetectionDebug';

function App() {
  const { toasts, removeToast } = useToast();
  const location = useLocation();
  
  // Hide navbar for public forms (public forms are now handled by Form App)
  const isPublicForm = false;

  return (
    <div className="min-h-screen bg-gray-50">
      {!isPublicForm && <Navbar />}
      <main className={isPublicForm ? '' : 'container mx-auto px-4 py-8'}>
                    <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/builder/:flowId?" element={<FlowBuilder />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/form/:flowId" element={<FormView />} />


            </Routes>
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
