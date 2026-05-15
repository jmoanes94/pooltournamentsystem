import { Navigate, Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Navbar.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { AdminPage } from './pages/AdminPage.jsx';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col pool-grid">
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pb-16 pt-6 text-center sm:text-left">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="text-center text-slate-500 text-xs py-6 border-t border-white/5">
        Wednesday 8-Ball League · Updates in real time · No sign-in required
      </footer>
    </div>
  );
}
