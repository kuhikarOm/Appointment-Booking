import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Calendar, Clock, CheckCircle,
  Plus, ArrowRight, Activity, User
} from 'lucide-react';

interface Stats {
  total: number;
  pending: number;
  approved: number;
  completed: number;
  rejected: number;
}

interface Appointment {
  _id: string;
  doctor: { name: string; speciality: string };
  date: string;
  time: string;
  status: string;
  reason: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, completed: 0, rejected: 0 });
  const [recent, setRecent] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/appointments/my');
      const appointments: Appointment[] = res.data.appointments;
      setRecent(appointments.slice(0, 3));
      setStats({
        total: appointments.length,
        pending: appointments.filter(a => a.status === 'pending').length,
        approved: appointments.filter(a => a.status === 'approved').length,
        completed: appointments.filter(a => a.status === 'completed').length,
        rejected: appointments.filter(a => a.status === 'rejected').length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Appointments', value: stats.total, icon: Calendar, color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700' },
    { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700' },
    { label: 'Completed', value: stats.completed, icon: Activity, color: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-700' },
  ];

  const getStatusBadge = (status: string) => {
    const classes: Record<string, string> = {
      pending: 'badge-pending',
      approved: 'badge-approved',
      rejected: 'badge-rejected',
      completed: 'badge-completed',
    };
    return classes[status] || 'badge-pending';
  };

  const getHour = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 mb-8 text-white shadow-lg">
      {/* <div className="bg-gradient-to-r from-[oklch(0.45_0_0)] to-[oklch(0.66_0_0)] rounded-2xl p-6 md:p-8 mb-8 text-white shadow-lg"> */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">{getHour()},</p>
            <h1 className="text-2xl md:text-3xl font-bold">{user?.name} 👋</h1>
            <p className="text-blue-200 mt-2">Manage your health appointments with ease</p>
          </div>
          <Link
            to="/book-appointment"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-md self-start md:self-auto"
          >
            <Plus className="w-5 h-5" />
            Book New Appointment
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, bg, text }) => (
          <div key={label} className={`${bg} rounded-xl p-5 border border-opacity-20 animate-fade-in`}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-sm font-medium ${text}`}>{label}</p>
              <Icon className={`w-5 h-5 ${text}`} />
            </div>
            <p className={`text-3xl font-bold ${text}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent Appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Recent Appointments</h2>
          <Link
            to="/my-appointments"
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No appointments yet</p>
            <p className="text-gray-400 text-sm mt-1">Book your first appointment to get started</p>
            <Link to="/book-appointment" className="btn-primary inline-flex items-center gap-2 mt-4">
              <Plus className="w-4 h-4" /> Book Appointment
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((apt) => (
              <div key={apt._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{apt.doctor?.name}</p>
                    <p className="text-xs text-gray-500">{apt.doctor?.speciality}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{apt.date} • {apt.time}</p>
                  <span className={`${getStatusBadge(apt.status)} mt-1`}>
                    {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Link to="/book-appointment" className="card hover:shadow-md transition-shadow group cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Book Appointment</h3>
              <p className="text-sm text-gray-500">Schedule a new visit with a doctor</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-blue-600 transition-colors" />
          </div>
        </Link>
        <Link to="/my-appointments" className="card hover:shadow-md transition-shadow group cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">My Appointments</h3>
              <p className="text-sm text-gray-500">View and manage your appointments</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-green-600 transition-colors" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
