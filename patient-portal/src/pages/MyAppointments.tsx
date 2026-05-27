import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  Calendar, Clock, User, Trash2, Download, 
  Filter, SortAsc, FileText, DollarSign, Pill
} from 'lucide-react';

interface Appointment {
  _id: string;
  doctor: { name: string; speciality: string; consultationFee: number; qualification: string };
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  prescription?: string;
  medicineNotes?: string;
  amount?: number;
  invoiceNumber?: string;
  createdAt: string;
}

const MyAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('latest');
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [filter, sort]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      params.append('sort', sort);
      const res = await api.get(`/appointments/my?${params}`);
      setAppointments(res.data.appointments);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      toast.success('Appointment deleted');
      fetchAppointments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleDownloadReceipt = async (apt: Appointment) => {
    setDownloading(apt._id);
    try {
      const res = await api.get(`/appointments/${apt._id}/receipt`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${apt.invoiceNumber || apt._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Receipt downloaded!');
    } catch {
      toast.error('Failed to download receipt');
    } finally {
      setDownloading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'badge-pending',
      approved: 'badge-approved',
      rejected: 'badge-rejected',
      completed: 'badge-completed',
    };
    return map[status] || 'badge-pending';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      pending: '⏳',
      approved: '✅',
      rejected: '❌',
      completed: '🎉',
    };
    return icons[status] || '⏳';
  };

  const filterOptions = ['all', 'pending', 'approved', 'rejected', 'completed'];
  const sortOptions = [
    { value: 'latest', label: 'Latest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'date', label: 'By Date' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-500 mt-1">{appointments.length} appointment{appointments.length !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter by Status
            </label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filter === f
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:w-48">
            <label className="block text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
              <SortAsc className="w-3 h-3" /> Sort by
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input-field text-sm"
            >
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="card text-center py-16">
          <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No appointments found</h3>
          <p className="text-gray-400 mt-1">
            {filter !== 'all' ? `No ${filter} appointments` : 'You have no appointments yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div key={apt._id} className="card hover:shadow-md transition-shadow animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Doctor Info */}
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{apt.doctor?.name}</h3>
                      <span className={getStatusBadge(apt.status)}>
                        {getStatusIcon(apt.status)} {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-blue-600 font-medium">{apt.doctor?.speciality}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{apt.doctor?.qualification}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-400" /> {apt.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-400" /> {apt.time}
                      </span>
                    </div>
                    
                    <div className="mt-2 flex items-start gap-1.5">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 line-clamp-2">{apt.reason}</p>
                    </div>

                    {/* Completed Details */}
                    {apt.status === 'completed' && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        {apt.prescription && (
                          <div className="flex items-start gap-2 mb-2">
                            <FileText className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-green-700">Prescription</p>
                              <p className="text-sm text-green-800">{apt.prescription}</p>
                            </div>
                          </div>
                        )}
                        {apt.medicineNotes && (
                          <div className="flex items-start gap-2 mb-2">
                            <Pill className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-green-700">Medicine Notes</p>
                              <p className="text-sm text-green-800">{apt.medicineNotes}</p>
                            </div>
                          </div>
                        )}
                        {apt.amount !== undefined && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <p className="text-sm font-semibold text-green-700">
                              Consultation Fee: ${apt.amount}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 sm:items-end">
                  {apt.status === 'completed' && (
                    <button
                      onClick={() => handleDownloadReceipt(apt)}
                      disabled={downloading === apt._id}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      {downloading === apt._id ? (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Receipt
                    </button>
                  )}
                  {['completed', 'rejected'].includes(apt.status) && (
                    <button
                      onClick={() => handleDelete(apt._id)}
                      className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
