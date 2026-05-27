import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Calendar, Home, LogOut, Menu, X, User, Stethoscope, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/book-appointment', label: 'Book Appointment', icon: Calendar },
    { to: '/my-appointments', label: 'My Appointments', icon: Stethoscope },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 shadow-sm"
      style={{ backgroundColor: dark ? '#0f172a' : 'white', borderBottom: dark ? '1px solid #1e293b' : '1px solid #e5e7eb' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{ backgroundColor: '#059669' }}>
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl" style={{ color: dark ? '#f1f5f9' : '#111827' }}>MediCare</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: isActive(to) ? (dark ? '#064e3b' : '#ecfdf5') : 'transparent',
                  color: isActive(to) ? '#059669' : (dark ? '#94a3b8' : '#6b7280'),
                }}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme toggle */}
            <button onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors"
              style={{ backgroundColor: dark ? '#1e293b' : '#f3f4f6', color: dark ? '#fbbf24' : '#6b7280' }}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
              style={{ backgroundColor: dark ? '#1e293b' : '#f9fafb', borderColor: dark ? '#334155' : '#e5e7eb' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: '#059669' }}>
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium" style={{ color: dark ? '#e2e8f0' : '#374151' }}>{user?.name}</span>
            </div>

            <button onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ color: '#dc2626' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = dark ? '#450a0a' : '#fef2f2')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg transition-colors"
              style={{ backgroundColor: dark ? '#1e293b' : '#f3f4f6', color: dark ? '#fbbf24' : '#6b7280' }}>
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg transition-colors"
              style={{ color: dark ? '#94a3b8' : '#6b7280' }}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t animate-fade-in"
          style={{ backgroundColor: dark ? '#0f172a' : 'white', borderColor: dark ? '#1e293b' : '#e5e7eb' }}>
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: isActive(to) ? (dark ? '#064e3b' : '#ecfdf5') : 'transparent',
                  color: isActive(to) ? '#059669' : (dark ? '#94a3b8' : '#6b7280'),
                }}>
                <Icon className="w-5 h-5" />{label}
              </Link>
            ))}
            <div className="pt-2 border-t" style={{ borderColor: dark ? '#1e293b' : '#e5e7eb' }}>
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#059669' }}>
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: dark ? '#f1f5f9' : '#111827' }}>{user?.name}</p>
                  <p className="text-xs" style={{ color: dark ? '#64748b' : '#9ca3af' }}>{user?.email}</p>
                </div>
              </div>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors"
                style={{ color: '#dc2626' }}>
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
