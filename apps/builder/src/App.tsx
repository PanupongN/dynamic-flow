import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { FlowBuilder } from './pages/FlowBuilder';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';

function App() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/builder/:flowId?" element={<FlowBuilder />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
