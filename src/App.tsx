import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SeriesPage from './pages/SeriesPage';
import LessonPage from './pages/LessonPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminSeries from './pages/AdminSeries';
import AdminLessons from './pages/AdminLessons';
import AdminSettings from './pages/AdminSettings';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="series/:seriesId" element={<SeriesPage />} />
          <Route path="lesson/:lessonId" element={<LessonPage />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="series" element={<AdminSeries />} />
          <Route path="lessons" element={<AdminLessons />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
