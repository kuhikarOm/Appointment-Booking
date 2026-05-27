import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import {
  Calendar, Clock, User, Trash2, CheckCircle, XCircle,
  Filter, SortAsc, FileText, DollarSign, Printer, X
} from 'lucide-react';

interface Appointment {
  _id: string;
  patient: { name: string; email: string; phone?: string };
  doctor: { name: string; speciality: string; consultationFee: number };
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  prescription?: string;
  amount?: number;
  invoiceNumber?: string;
  createdAt: string;
}

interface BillingForm {
  prescription: string;
  amount: string;
}

const Appointments = () => {
  const { dark } = useTheme();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('latest');
  const [billingModal, setBillingModal] = useState<Appointment | null>(null);
  const [billingForm, setBillingForm] = useState<BillingForm>({ prescription: '', amount: '' });
  const [submitting, setSubmitting] = useState(false);
  const [printing, setPrinting] = useState<string | null>(null);

  const cardBg = dark ? '#1e293b' : 'white';
  const pageBg = dark ? '#0f172a' : '#f8fafc';
  const textPrimary = dark ? '#f1f5f9' : '#111827';
  const textSecondary = dark ? '#94a3b8' : '#6b7280';
  const borderColor = dark ? '#334155' : '#f3f4f6';
  const inputBg = dark ? '#0f172a' : 'white';
  const inputBorder = dark ? '#475569' : '#d1d5db';

  useEffect(() => { fetchAppointments(); }, [filter, sort]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      params.append('sort', sort);
      const res = await api.get(`/admin/appointments?${params}`);
      setAppointments(res.data.appointments);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.put(`/admin/appointments/${id}/status`, { status });
      toast.success(`Appointment ${status} successfully`);
      fetchAppointments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${status} appointment`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this appointment permanently?')) return;
    try {
      await api.delete(`/admin/appointments/${id}`);
      toast.success('Appointment deleted successfully');
      fetchAppointments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete appointment');
    }
  };

  const handleComplete = async () => {
    if (!billingModal) return;
    if (!billingForm.prescription || !billingForm.amount) {
      toast.error('Please fill in prescription and fee');
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/admin/appointments/${billingModal._id}/complete`, {
        prescription: billingForm.prescription,
        medicineNotes: '',
        amount: billingForm.amount
      });
      toast.success('Appointment completed with billing!');
      setBillingModal(null);
      setBillingForm({ prescription: '', amount: '' });
      fetchAppointments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to complete appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintInvoice = async (apt: Appointment) => {
    setPrinting(apt._id);
    try {
      const res = await api.get(`/admin/appointments/${apt._id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      // Open in new tab for printing
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
        };
      }
      toast.success('Invoice opened for printing!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setPrinting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'badge-pending', approved: 'badge-approved',
      rejected: 'badge-rejected', completed: 'badge-completed',
    };
    return map[status] || 'badge-pending';
  };

  const filterOptions = ['all', 'pending', 'approved', 'rejected', 'completed'];
  const sortOptions = [
    { value: 'latest', label: 'Latest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'date', label: 'By Date' },
  ];

  return (
    <div className="animate-fade-in min-h-screen transition-colors duration-300" style={{ backgroundColor: pageBg }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Bookings Management</h1>
          <p className="mt-1" style={{ color: textSecondary }}>{appointments.length} appointment{appointments.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl p-4 mb-6 shadow-sm" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium mb-2 flex items-center gap-1" style={{ color: textSecondary }}>
              <Filter className="w-3 h-3" /> Filter by Status
            </label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: filter === f ? '#4f46e5' : (dark ? '#334155' : '#f3f4f6'),
                    color: filter === f ? 'white' : textSecondary,
                  }}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:w-48">
            <label className="block text-xs font-medium mb-2 flex items-center gap-1" style={{ color: textSecondary }}>
              <SortAsc className="w-3 h-3" /> Sort by
            </label>
            <select value={sort} onChange={e => setSort(e.target.value)} className="input-field text-sm"
              style={{ backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }}>
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Appointments */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }}></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="rounded-xl p-16 text-center shadow-sm" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
          <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: dark ? '#475569' : '#d1d5db' }} />
          <h3 className="text-lg font-semibold" style={{ color: textPrimary }}>No appointments found</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map(apt => (
            <div key={apt._id} className="rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md"
              style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="flex-1">
                  {/* Status + Invoice */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={getStatusBadge(apt.status)}>
                      {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                    </span>
                    {apt.invoiceNumber && (
                      <span className="text-xs px-2 py-0.5 rounded"
                        style={{ backgroundColor: dark ? '#334155' : '#f3f4f6', color: textSecondary }}>
                        {apt.invoiceNumber}
                      </span>
                    )}
                  </div>

                  {/* Patient & Doctor */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                    <div className="flex items-start gap-2">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: dark ? '#1e3a5f' : '#dbeafe' }}>
                        <User className="w-5 h-5" style={{ color: '#3b82f6' }} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: textSecondary }}>Patient</p>
                        <p className="font-semibold text-sm" style={{ color: textPrimary }}>{apt.patient?.name}</p>
                        <p className="text-xs" style={{ color: textSecondary }}>{apt.patient?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: dark ? '#312e81' : '#e0e7ff' }}>
                        <User className="w-5 h-5" style={{ color: '#6366f1' }} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: textSecondary }}>Doctor</p>
                        <p className="font-semibold text-sm" style={{ color: textPrimary }}>{apt.doctor?.name}</p>
                        <p className="text-xs" style={{ color: textSecondary }}>{apt.doctor?.speciality}</p>
                      </div>
                    </div>
                  </div>

                  {/* Date, Time, Amount */}
                  <div className="flex flex-wrap gap-4 text-sm mb-2" style={{ color: textSecondary }}>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {apt.date}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {apt.time}</span>
                    {apt.amount !== undefined && apt.amount > 0 && (
                      <span className="flex items-center gap-1.5 font-semibold" style={{ color: '#16a34a' }}>
                        <DollarSign className="w-4 h-4" /> ${apt.amount}
                      </span>
                    )}
                  </div>

                  {/* Reason */}
                  <div className="flex items-start gap-1.5">
                    <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: textSecondary }} />
                    <p className="text-sm" style={{ color: textSecondary }}>{apt.reason}</p>
                  </div>

                  {/* Prescription (completed) */}
                  {apt.status === 'completed' && apt.prescription && (
                    <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: dark ? '#064e3b' : '#f0fdf4', border: `1px solid ${dark ? '#065f46' : '#bbf7d0'}` }}>
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#16a34a' }} />
                        <div>
                          <p className="text-xs font-semibold" style={{ color: '#16a34a' }}>Prescription</p>
                          <p className="text-sm mt-0.5" style={{ color: dark ? '#86efac' : '#166534' }}>{apt.prescription}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap lg:flex-col gap-2 lg:w-36">
                  {apt.status === 'pending' && (
                    <>
                      <button onClick={() => handleStatusUpdate(apt._id, 'approved')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{ backgroundColor: dark ? '#064e3b' : '#f0fdf4', color: '#16a34a' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = dark ? '#065f46' : '#dcfce7')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = dark ? '#064e3b' : '#f0fdf4')}>
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button onClick={() => handleStatusUpdate(apt._id, 'rejected')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{ backgroundColor: dark ? '#450a0a' : '#fef2f2', color: '#dc2626' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = dark ? '#7f1d1d' : '#fee2e2')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = dark ? '#450a0a' : '#fef2f2')}>
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </>
                  )}
                  {apt.status === 'approved' && (
                    <button onClick={() => { setBillingModal(apt); setBillingForm({ prescription: '', amount: String(apt.doctor?.consultationFee || '') }); }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{ backgroundColor: dark ? '#1e3a5f' : '#eff6ff', color: '#3b82f6' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = dark ? '#1e40af' : '#dbeafe')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = dark ? '#1e3a5f' : '#eff6ff')}>
                      <CheckCircle className="w-4 h-4" /> Complete
                    </button>
                  )}
                  {apt.status === 'completed' && (
                    <button onClick={() => handlePrintInvoice(apt)} disabled={printing === apt._id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{ backgroundColor: dark ? '#312e81' : '#eef2ff', color: '#6366f1' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = dark ? '#3730a3' : '#e0e7ff')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = dark ? '#312e81' : '#eef2ff')}>
                      {printing === apt._id
                        ? <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }}></div>
                        : <Printer className="w-4 h-4" />}
                      Print
                    </button>
                  )}
                  {['completed', 'rejected'].includes(apt.status) && (
                    <button onClick={() => handleDelete(apt._id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{ backgroundColor: dark ? '#450a0a' : '#fef2f2', color: '#dc2626' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = dark ? '#7f1d1d' : '#fee2e2')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = dark ? '#450a0a' : '#fef2f2')}>
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Billing Modal — only prescription + fee */}
      {billingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setBillingModal(null)} />
          <div className="relative rounded-2xl shadow-2xl w-full max-w-md animate-fade-in"
            style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6" style={{ borderBottom: `1px solid ${borderColor}` }}>
              <div>
                <h2 className="text-xl font-bold" style={{ color: textPrimary }}>Complete Appointment</h2>
                <p className="text-sm mt-0.5" style={{ color: textSecondary }}>Add prescription and consultation fee</p>
              </div>
              <button onClick={() => setBillingModal(null)} className="p-2 rounded-lg transition-colors"
                style={{ color: textSecondary }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = dark ? '#334155' : '#f3f4f6')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Summary */}
              <div className="rounded-xl p-4" style={{ backgroundColor: dark ? '#0f172a' : '#f8fafc', border: `1px solid ${borderColor}` }}>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-medium uppercase" style={{ color: textSecondary }}>Patient</p>
                    <p className="font-semibold mt-0.5" style={{ color: textPrimary }}>{billingModal.patient?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase" style={{ color: textSecondary }}>Doctor</p>
                    <p className="font-semibold mt-0.5" style={{ color: textPrimary }}>{billingModal.doctor?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase" style={{ color: textSecondary }}>Date</p>
                    <p className="mt-0.5" style={{ color: textPrimary }}>{billingModal.date}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase" style={{ color: textSecondary }}>Time</p>
                    <p className="mt-0.5" style={{ color: textPrimary }}>{billingModal.time}</p>
                  </div>
                </div>
              </div>

              {/* Prescription */}
              <div>
                <label className="block text-sm font-medium mb-1.5 flex items-center gap-2" style={{ color: textPrimary }}>
                  <FileText className="w-4 h-4" style={{ color: '#6366f1' }} /> Prescription *
                </label>
                <textarea value={billingForm.prescription}
                  onChange={e => setBillingForm({ ...billingForm, prescription: e.target.value })}
                  rows={4} className="input-field resize-none"
                  placeholder="Enter prescription details, medicines, dosage..."
                  style={{ backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }} />
              </div>

              {/* Fee */}
              <div>
                <label className="block text-sm font-medium mb-1.5 flex items-center gap-2" style={{ color: textPrimary }}>
                  <DollarSign className="w-4 h-4" style={{ color: '#16a34a' }} /> Consultation Fee ($) *
                </label>
                <input type="number" value={billingForm.amount}
                  onChange={e => setBillingForm({ ...billingForm, amount: e.target.value })}
                  className="input-field" placeholder="Enter fee amount" min="0"
                  style={{ backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }} />
                <p className="text-xs mt-1" style={{ color: textSecondary }}>
                  Standard fee: ${billingModal.doctor?.consultationFee}
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6" style={{ borderTop: `1px solid ${borderColor}` }}>
              <button onClick={() => setBillingModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleComplete} disabled={submitting}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                {submitting
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Saving...</>
                  : <><CheckCircle className="w-4 h-4" />Complete & Save</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
