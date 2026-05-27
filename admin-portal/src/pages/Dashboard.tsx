import { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Calendar, Clock, CheckCircle, XCircle, 
  DollarSign, Users, UserCog, Activity,
  TrendingUp, User
} from 'lucide-react';

interface Stats {
  total: number;
  pending: number;
  approved: number;
  completed: number;
  rejected: number;
  revenue: number;
  totalDoctors: number;
  totalPatients: number;
}

interface Appointment {
  _id: string;
  patient: { name: string; email: string };
  doctor: { name: string; speciality: string };
  date: string;
  time: string;
  status: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    total: 0, pending: 0, approved: 0, completed: 0,
    rejected: 0, revenue: 0, totalDoctors: 0, totalPatients: 0
  });
  const [recent, setRecent] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.stats);
      setRecent(res.data.recentAppointments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Appointments', value: stats.total, icon: Calendar, color: 'from-blue-500 to-blue-600', textColor: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-yellow-500 to-yellow-600', textColor: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'from-green-500 to-green-600', textColor: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Completed', value: stats.completed, icon: Activity, color: 'from-purple-500 to-purple-600', textColor: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'from-red-500 to-red-600', textColor: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Total Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'from-emerald-500 to-emerald-600', textColor: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Doctors', value: stats.totalDoctors, icon: UserCog, color: 'from-indigo-500 to-indigo-600', textColor: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total Patients', value: stats.totalPatients, icon: Users, color: 'from-pink-500 to-pink-600', textColor: 'text-pink-600', bg: 'bg-pink-50' },
  ];

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'badge-pending',
      approved: 'badge-approved',
      rejected: 'badge-rejected',
      completed: 'badge-completed',
    };
    return map[status] || 'badge-pending';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 md:p-8 mb-8 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-indigo-200 mt-1">Overview of your clinic management system</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, textColor, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-5 border border-white/50 animate-fade-in`}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-xs font-semibold ${textColor} uppercase tracking-wide`}>{label}</p>
              <Icon className={`w-5 h-5 ${textColor}`} />
            </div>
            <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent Appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Recent Appointments</h2>
          <span className="text-sm text-gray-500">Last 5 appointments</span>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No appointments yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3">Patient</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3">Doctor</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3">Date & Time</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map((apt) => (
                  <tr key={apt._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{apt.patient?.name}</p>
                          <p className="text-xs text-gray-500">{apt.patient?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <p className="text-sm font-medium text-gray-900">{apt.doctor?.name}</p>
                      <p className="text-xs text-gray-500">{apt.doctor?.speciality}</p>
                    </td>
                    <td className="py-3">
                      <p className="text-sm text-gray-700">{apt.date}</p>
                      <p className="text-xs text-gray-500">{apt.time}</p>
                    </td>
                    <td className="py-3">
                      <span className={getStatusBadge(apt.status)}>
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
