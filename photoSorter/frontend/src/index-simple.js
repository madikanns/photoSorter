import React from 'react';
import ReactDOM from 'react-dom/client';

function SimpleApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>📸 photoSorter - Simple Test</h1>
      <p>If you can see this, the basic React setup is working!</p>
      <p>Electron API available: {window.electronAPI ? 'Yes' : 'No'}</p>
      <p>Window object keys: {Object.keys(window).filter(k => k.includes('electron')).join(', ') || 'None'}</p>
      <button 
        onClick={() => {
          console.log('Button clicked');
          console.log('window.electronAPI:', window.electronAPI);
          console.log('window keys:', Object.keys(window));
          
          if (window.electronAPI) {
            if (window.electronAPI.test) {
              alert(window.electronAPI.test());
            } else {
              alert('Electron API exists but test method not found');
            }
          } else {
            alert('This app must be run in Electron');
          }
        }}
        style={{ padding: '10px 20px', fontSize: '16px' }}
      >
        Test Electron
      </button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<SimpleApp />);
