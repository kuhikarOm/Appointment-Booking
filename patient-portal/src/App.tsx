import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen" style={{ transition: 'background-color 0.3s' }}>
    <Navbar />
    <main>{children}</main>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '10px', background: '#333', color: '#fff' },
              success: { style: { background: '#059669' } },
              error: { style: { background: '#dc2626' } },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
            } />
            <Route path="/book-appointment" element={
              <ProtectedRoute><Layout><BookAppointment /></Layout></ProtectedRoute>
            } />
            <Route path="/my-appointments" element={
              <ProtectedRoute><Layout><MyAppointments /></Layout></ProtectedRoute>
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
