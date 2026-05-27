import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, Calendar, UserCog, LogOut,
  Stethoscope, Menu, X, ChevronRight, Shield, Sun, Moon
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/appointments', label: 'Bookings', icon: Calendar },
    { to: '/doctors', label: 'Manage Doctors', icon: UserCog },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Light theme: deep teal-slate, Dark theme: very dark navy
  const sidebarBg = dark ? '#0d1117' : '#0f4c75';
  const sidebarBorder = dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.12)';
  const activeItemBg = dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.18)';
  const hoverItemBg = dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.10)';
  const textMuted = dark ? 'rgba(148,163,184,0.9)' : 'rgba(186,230,253,0.9)';

  const SidebarContent = () => (
    <div
      className="flex flex-col"
      style={{
        backgroundColor: sidebarBg,
        height: '100%',
        minHeight: '100vh',
      }}
    >
      {/* Logo */}
      <div className="p-6 flex-shrink-0" style={{ borderBottom: `1px solid ${sidebarBorder}` }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
            <Stethoscope className="w-6 h-6" style={{ color: '#0f4c75' }} />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-tight">MediCare</h1>
            <p className="text-xs" style={{ color: textMuted }}>Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navLinks.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: isActive(to) ? activeItemBg : 'transparent',
              color: isActive(to) ? 'white' : textMuted,
            }}
            onMouseEnter={e => {
              if (!isActive(to)) e.currentTarget.style.backgroundColor = hoverItemBg;
            }}
            onMouseLeave={e => {
              if (!isActive(to)) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1">{label}</span>
            {isActive(to) && <ChevronRight className="w-4 h-4 opacity-70" />}
          </Link>
        ))}
      </nav>

      {/* Bottom: Theme + User + Logout */}
      <div className="flex-shrink-0 p-4 space-y-1" style={{ borderTop: `1px solid ${sidebarBorder}` }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ color: textMuted }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = hoverItemBg)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {dark
            ? <Sun className="w-5 h-5" style={{ color: '#fbbf24' }} />
            : <Moon className="w-5 h-5 text-white" />}
          <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl"
          style={{ backgroundColor: hoverItemBg }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs truncate" style={{ color: textMuted }}>{user?.email}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all"
          style={{ color: textMuted }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.25)';
            e.currentTarget.style.color = '#fca5a5';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = textMuted;
          }}
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar — fixed, full viewport height */}
      <aside
        className="hidden lg:block fixed left-0 top-0 z-40"
        style={{ width: '256px', height: '100vh' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between shadow-lg"
        style={{ backgroundColor: sidebarBg }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Stethoscope className="w-5 h-5" style={{ color: '#0f4c75' }} />
          </div>
          <span className="font-bold text-white text-sm">MediCare Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-white"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            {dark ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-white"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside
            className="absolute left-0 top-0 bottom-0 w-72 animate-slide-in"
            style={{ height: '100vh' }}
          >
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
