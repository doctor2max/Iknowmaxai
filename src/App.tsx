import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useState, useEffect, createContext, useContext } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LessonPage from './pages/LessonPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import CoursesPage from './pages/CoursesPage';

// Auth Context
const AuthContext = createContext<{
  user: any;
  login: (user: any, token?: string) => void;
  logout: () => void;
  loading: boolean;
} | null>(null);

export const useAuth = () => useContext(AuthContext)!;

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/auth/me', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const login = (userData: any, token?: string) => {
    setUser(userData);
    if (token) localStorage.setItem('token', token);
  };
  const logout = () => {
    localStorage.removeItem('token');
    fetch('/api/auth/logout', { method: 'POST' }).then(() => setUser(null));
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <HelmetProvider>
      <AuthContext.Provider value={{ user, login, logout, loading }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="lesson/:slug" element={<LessonPage />} />
            </Route>
            
            <Route path="/admin/login" element={user?.role === 'admin' ? <Navigate to="/admin" /> : <AdminLogin />} />
            <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/admin/login" />} />
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </HelmetProvider>
  );
}
