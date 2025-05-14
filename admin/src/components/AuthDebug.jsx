import { useState } from 'react';
import { useAuth } from '../AuthContext';

const AuthDebug = () => {
  const { token } = useAuth();
  const [showDebug, setShowDebug] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const testAuth = async () => {
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/admin/auth/validate`;
      
      console.log("Testing auth with URL:", url);
      console.log("Token:", token ? `${token.substring(0, 10)}...` : 'No token');
      
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      
      setTestResult({
        status: res.status,
        ok: res.ok,
        data
      });
    } catch (err) {
      console.error("Auth test error:", err);
      setTestResult({
        error: err.message
      });
    }
  };

  if (!showDebug) {
    return (
      <button 
        onClick={() => setShowDebug(true)}
        style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '10px',
          background: '#f0f0f0',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '5px 10px',
          fontSize: '12px',
          cursor: 'pointer'
        }}
      >
        Debug
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: '#fff',
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '10px',
      width: '300px',
      maxHeight: '400px',
      overflowY: 'auto',
      zIndex: 1000,
      boxShadow: '0 0 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h3 style={{ margin: 0 }}>Auth Debug</h3>
        <button 
          onClick={() => setShowDebug(false)}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Token:</strong> 
        <div style={{ 
          fontSize: '12px', 
          wordBreak: 'break-all', 
          background: '#f5f5f5', 
          padding: '5px',
          borderRadius: '4px',
          maxHeight: '60px',
          overflowY: 'auto'
        }}>
          {token ? token : 'No token found'}
        </div>
      </div>
      
      <button 
        onClick={testAuth}
        style={{ 
          background: '#4CAF50', 
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '5px 10px',
          cursor: 'pointer',
          marginBottom: '10px'
        }}
      >
        Test Authentication
      </button>
      
      {testResult && (
        <div>
          <h4 style={{ marginBottom: '5px' }}>Test Result:</h4>
          <div style={{ 
            fontSize: '12px', 
            background: testResult.ok ? '#e8f5e9' : '#ffebee', 
            padding: '5px',
            borderRadius: '4px',
            maxHeight: '150px',
            overflowY: 'auto'
          }}>
            {testResult.error ? (
              <div>Error: {testResult.error}</div>
            ) : (
              <>
                <div>Status: {testResult.status}</div>
                <div>Success: {testResult.ok ? 'Yes' : 'No'}</div>
                <pre>{JSON.stringify(testResult.data, null, 2)}</pre>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthDebug;