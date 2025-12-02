import React from 'react';
import ReactDOM from 'react-dom/client';
// Import the component under its standard name
import App from './App.jsx'; 
// Assuming the default index.css/Tailwind styles are not needed or are loaded elsewhere

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Render the standard App component */}
    <App />
  </React.StrictMode>,
);
