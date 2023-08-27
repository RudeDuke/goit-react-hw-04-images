import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App/App_v.2.0';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

document.cookie = 'cookieName=value; SameSite=None; Secure';
