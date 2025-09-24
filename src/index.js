import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { ProfileProvider } from './pages/Context API/ProfileContext';
import ErrorBoundary from './ErrorBoundary';
import GlobalErrorHandler from './GlobalErrorHandler';

// --- Clickjacking Defensive Code ---
if (window.top !== window.self) {
  window.top.location = window.self.location;
}

window.onerror = (message, source, lineno, colno, err) => {
  console.warn("Suppressed global error:", message);
  // optionally show a friendly message or do nothing
  return true; // prevents the red overlay
};

window.onunhandledrejection = (event) => {
  console.warn("Suppressed unhandled promise rejection:", event.reason);
  return true; // prevents the red overlay
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <GlobalErrorHandler />
    <ProfileProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ProfileProvider>
  </ErrorBoundary>
);

reportWebVitals();
