import React from 'react';

const EnvDebug = () => {
  if (import.meta.env.MODE !== 'development') {
    return null; // Only show in development
  }

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: '#f0f0f0', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      overflow: 'auto',
      maxHeight: '200px'
    }}>
      <h4>Environment Variables:</h4>
      <ul style={{ margin: 0, padding: '0 0 0 20px' }}>
        <li>VITE_BACKEND_URL: {import.meta.env.VITE_BACKEND_URL || 'Not set'}</li>
        <li>VITE_FIREBASE_API_KEY: {import.meta.env.VITE_FIREBASE_API_KEY ? 'Set ✓' : 'Not set ✗'}</li>
        <li>VITE_FIREBASE_AUTH_DOMAIN: {import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'Not set ✗'}</li>
        <li>VITE_FIREBASE_PROJECT_ID: {import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Not set ✗'}</li>
        <li>Mode: {import.meta.env.MODE}</li>
      </ul>
      <button 
        onClick={() => console.log('All env vars:', import.meta.env)} 
        style={{ 
          fontSize: '10px', 
          padding: '2px 5px', 
          marginTop: '5px' 
        }}
      >
        Log All Env Vars
      </button>
    </div>
  );
};

export default EnvDebug;