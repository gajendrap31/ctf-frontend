import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import ScrollToTop from './pages/ScrollTop';
import { Tooltip } from 'react-tooltip'
import { ProfileProvider } from './pages/Context API/ProfileContext';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ProfileProvider>
  <BrowserRouter>
  {/* <ScrollToTop /> */}
    {/* <React.StrictMode> */}
      <App />
    {/* </React.StrictMode> */}
  </BrowserRouter>
  </ProfileProvider>
);

// If you want to start measuring performance in your app, pass a function
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
