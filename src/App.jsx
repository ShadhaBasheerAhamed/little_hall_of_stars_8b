import { useEffect } from 'react';
import { Redirect, navigate, useRoute } from './router.jsx';
import { getSession, loginStudent, logout } from './auth.js';
import { useStudents } from './hooks/useContent.js';
import LoginPage from './pages/LoginPage.jsx';
import StudentHome from './pages/StudentHome.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminEditor from './pages/AdminEditor.jsx';
import QRGenerator from './pages/QRGenerator.jsx';
import StudentPreview from './pages/StudentPreview.jsx';
import GiftPage from './pages/GiftPage.jsx';
import GiftAdmin from './pages/GiftAdmin.jsx';

function QRStudentAccess({ student }) {
  useEffect(() => {
    loginStudent(student.rollNumber);
    navigate('/me', { replace: true });
  }, [student.rollNumber]);
  return null;
}

export default function App() {
  const { path, query } = useRoute();
  const students = useStudents();
  const session = getSession();

  // Always start a new page at the top.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  // ---------- Children's Day AR gift (public: the QR on each card opens it directly) ----------
  if (path.startsWith('/gift/')) return <GiftPage slug={decodeURIComponent(path.slice('/gift/'.length)).replace(/\/+$/, '')} />;

  // ---------- Teacher area ----------
  if (path === '/admin' || path.startsWith('/admin/')) {
    const isAdmin = session && session.role === 'admin';
    if (!isAdmin) return <AdminLogin />;
    const parts = path.split('/').filter(Boolean); // ['admin', ...]
    const sub = parts[1] || 'dashboard';
    if (sub === 'dashboard') return <AdminDashboard students={students} />;
    if (sub === 'qr') return <QRGenerator students={students} />;
    if (sub === 'gifts') return <GiftAdmin />;
    if (sub === 'student') {
      const s = students.find((x) => String(x.rollNumber) === parts[2]);
      return s ? <AdminEditor student={s} /> : <Redirect to="/admin/dashboard" />;
    }
    if (sub === 'preview') {
      const s = students.find((x) => String(x.rollNumber) === parts[2]);
      if (!s) return <Redirect to="/admin/dashboard" />;
      const rest = '/' + parts.slice(3).join('/');
      return <StudentPreview student={s} rest={rest === '/' ? '' : rest} />;
    }
    return <Redirect to="/admin/dashboard" />;
  }

  // QR cards carry a roll number and open that student's experience without a PIN.
  if (path === '/' && query.star) {
    const student = students.find((s) => String(s.rollNumber) === query.star);
    if (student) return <QRStudentAccess student={student} />;
  }

  // ---------- Student area ----------
  if (path === '/me' || path.startsWith('/me/')) {
    // The student is identified only by the signed-in session, never by the URL,
    // so changing the address can never open someone else's world.
    const student = session && session.role === 'student' ? students.find((s) => s.rollNumber === session.roll) : null;
    if (!student) return <Redirect to="/" />;
    const rest = path.slice('/me'.length);
    const exit = () => {
      logout();
      navigate('/', { replace: true });
    };
    return <StudentHome student={student} base="/me" rest={rest} onExit={exit} />;
  }

  // ---------- Login ----------
  if (session && session.role === 'student' && students.some((s) => s.rollNumber === session.roll) && path === '/') {
    return <Redirect to="/me" />;
  }
  if (path === '/' || path === '/login') return <LoginPage students={students} query={query} />;
  return <Redirect to="/" />;
}
