import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Stethoscope, Mail, Lock, User } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
      style={{ background: dark ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #d1fae5 100%)' }}>
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-4"
            style={{ backgroundColor: '#059669' }}>
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: textPrimary }}>MediCare</h1>
          <p className="mt-1" style={{ color: textSecondary }}>Patient Portal</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl shadow-xl p-8 transition-colors duration-300"
          style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
          <h2 className="text-2xl font-bold mb-2" style={{ color: textPrimary }}>Create account</h2>
          <p className="mb-6" style={{ color: textSecondary }}>Join MediCare today</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: textPrimary }}>Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: textSecondary }} />
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  className="input-field pl-10" placeholder="John Doe" required
                  style={{ backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: textPrimary }}>Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: textSecondary }} />
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  className="input-field pl-10" placeholder="you@example.com" required
                  style={{ backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: textPrimary }}>Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: textSecondary }} />
                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password}
                  onChange={handleChange} className="input-field pl-10 pr-10" placeholder="Min. 6 characters" required
                  style={{ backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: textSecondary }}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3 mt-2">
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Creating account...</>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: textSecondary }}>
            Already have an account?{' '}
            <Link to="/login" className="font-medium hover:underline" style={{ color: '#059669' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
