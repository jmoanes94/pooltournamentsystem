import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SocketProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            className: '!bg-slate-900/95 !text-slate-100 !border !border-white/10 !shadow-neon-cyan',
            duration: 3800,
          }}
        />
      </SocketProvider>
    </BrowserRouter>
  </StrictMode>,
);
