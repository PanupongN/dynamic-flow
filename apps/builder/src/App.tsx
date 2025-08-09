
import { Routes, Route, useLocation } from 'react-router-dom';
import { FlowBuilder } from './pages/FlowBuilder';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { FormView } from './pages/FormView';
import { PublicFormView } from './pages/PublicFormView';
import { PreviewFormView } from './pages/PreviewFormView';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';
import { CountryDetectionDebug } from './components/CountryDetectionDebug';

function App() {
  const { toasts, removeToast } = useToast();
  const location = useLocation();
  
  // Hide navbar for public forms
  const isPublicForm = location.pathname.startsWith('/public/');

  return (
    <div className="min-h-screen bg-gray-50">
      {!isPublicForm && <Navbar />}
      <main className={isPublicForm ? '' : 'container mx-auto px-4 py-8'}>
                    <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/builder/:flowId?" element={<FlowBuilder />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/form/:flowId" element={<FormView />} />
              <Route path="/preview/:flowId" element={<PreviewFormView />} />
              <Route path="/public/:flowId" element={<PublicFormView />} />
            </Routes>
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <CountryDetectionDebug />
    </div>
  );
}

export default App;
