import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Shield, Mail, Lock, Sun, Moon } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome, Admin!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  const cardBg = dark ? '#1e293b' : 'white';
  const textPrimary = dark ? '#f1f5f9' : '#111827';
  const textSecondary = dark ? '#94a3b8' : '#6b7280';
  const borderColor = dark ? '#334155' : '#e5e7eb';
  const inputBg = dark ? '#0f172a' : 'white';
  const inputBorder = dark ? '#475569' : '#d1d5db';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300"
      style={{ background: dark ? 'linear-gradient(135deg, #0d1117 0%, #0f172a 100%)' : 'linear-gradient(135deg, #0f4c75 0%, #1b6ca8 100%)' }}>

      <button onClick={toggleTheme}
        className="fixed top-4 right-4 p-2.5 rounded-xl shadow-md transition-colors"
        style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: dark ? '#fbbf24' : 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
        {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-2xl mb-4">
            <Shield className="w-10 h-10" style={{ color: '#0f4c75' }} />
          </div>
          <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
          <p className="text-indigo-200 mt-1">MediCare Management System</p>
        </div>

        <div className="rounded-2xl shadow-2xl p-8 transition-colors duration-300"
          style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
          <h2 className="text-2xl font-bold mb-2" style={{ color: textPrimary }}>Admin Sign In</h2>
          <p className="mb-4" style={{ color: textSecondary }}>Access the admin dashboard</p>

          <div className="rounded-lg p-3 mb-6" style={{ backgroundColor: dark ? '#0c2340' : '#e0f2fe', border: `1px solid ${dark ? '#1e3a5f' : '#bae6fd'}` }}>
            <p className="text-xs font-semibold" style={{ color: dark ? '#7dd3fc' : '#0369a1' }}>Demo Credentials</p>
            <p className="text-xs mt-0.5" style={{ color: dark ? '#38bdf8' : '#0284c7' }}>Email: admin@medicare.com</p>
            <p className="text-xs" style={{ color: dark ? '#38bdf8' : '#0284c7' }}>Password: admin123</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: textPrimary }}>Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: textSecondary }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input-field pl-10" placeholder="admin@medicare.com" required
                  style={{ backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: textPrimary }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: textSecondary }} />
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} className="input-field pl-10 pr-10"
                  placeholder="••••••••" required
                  style={{ backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: textSecondary }}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3">
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Signing in...</>
              ) : (
                <><Shield className="w-5 h-5" />Sign In as Admin</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
