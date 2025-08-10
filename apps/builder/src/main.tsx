import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
// import { ThemeProvider } from '@dynamic-flow/ui';
import App from './App';
import './index.css';
import './styles/phone-input.css';
import { preloadCountryDetection } from './utils/countryDetection';
import { AuthProvider } from './contexts/AuthContext';

const queryClient = new QueryClient();

// Preload country detection for faster phone input
preloadCountryDetection();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
