import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Doctors from './pages/Doctors';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { dark } = useTheme();
  return (
    <div
      className="flex transition-colors duration-300"
      style={{
        minHeight: '100vh',
        backgroundColor: dark ? '#0f172a' : '#f0f4f8',
      }}
    >
      <Sidebar />
      {/* Main content — offset by sidebar width on desktop */}
      <main
        className="flex-1 lg:ml-64 pt-16 lg:pt-0"
        style={{ minHeight: '100vh' }}
      >
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '10px', background: '#1e293b', color: '#f1f5f9' },
              success: { style: { background: '#059669' } },
              error: { style: { background: '#dc2626' } },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
            } />
            <Route path="/appointments" element={
              <ProtectedRoute><Layout><Appointments /></Layout></ProtectedRoute>
            } />
            <Route path="/doctors" element={
              <ProtectedRoute><Layout><Doctors /></Layout></ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
