import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import {
  Plus, Edit2, Trash2, User, X, Save, Search,
  Stethoscope, Clock, DollarSign, Calendar
} from 'lucide-react';

const SPECIALITIES = [
  'Cardiologist', 'Neurologist', 'Orthopedic', 'Dermatologist',
  'Pediatrician', 'Gynecologist', 'Psychiatrist', 'Ophthalmologist',
  'ENT Specialist', 'General Physician', 'Dentist'
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Unique color per speciality
const SPEC_COLORS: Record<string, { bg: string; text: string; darkBg: string }> = {
  'Cardiologist':     { bg: '#fee2e2', text: '#b91c1c', darkBg: '#7f1d1d' },
  'Neurologist':      { bg: '#ede9fe', text: '#6d28d9', darkBg: '#4c1d95' },
  'Orthopedic':       { bg: '#fef3c7', text: '#b45309', darkBg: '#78350f' },
  'Dermatologist':    { bg: '#fce7f3', text: '#be185d', darkBg: '#831843' },
  'Pediatrician':     { bg: '#d1fae5', text: '#065f46', darkBg: '#064e3b' },
  'Gynecologist':     { bg: '#fdf4ff', text: '#7e22ce', darkBg: '#581c87' },
  'Psychiatrist':     { bg: '#e0f2fe', text: '#0369a1', darkBg: '#0c4a6e' },
  'Ophthalmologist':  { bg: '#ecfdf5', text: '#047857', darkBg: '#064e3b' },
  'ENT Specialist':   { bg: '#fff7ed', text: '#c2410c', darkBg: '#7c2d12' },
  'General Physician':{ bg: '#f0f9ff', text: '#0369a1', darkBg: '#0c4a6e' },
};

interface Doctor {
  _id: string;
  name: string;
  speciality: string;
  experience: number;
  availability: string[];
  consultationFee: number;
  qualification: string;
  isActive: boolean;
}

interface DoctorForm {
  name: string;
  email: string;
  speciality: string;
  experience: string;
  availability: string[];
  consultationFee: string;
  qualification: string;
}

const emptyForm: DoctorForm = {
  name: '', email: '', speciality: '', experience: '',
  availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  consultationFee: '', qualification: 'MBBS'
};

const Doctors = () => {
  const { dark } = useTheme();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);
  const [form, setForm] = useState<DoctorForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterSpec, setFilterSpec] = useState('all');

  const pageBg    = dark ? '#0f172a' : '#f0f4f8';
  const cardBg    = dark ? '#1e293b' : 'white';
  const modalBg   = dark ? '#1e293b' : 'white';
  const textPrimary   = dark ? '#f1f5f9' : '#0f172a';
  const textSecondary = dark ? '#94a3b8' : '#64748b';
  const borderColor   = dark ? '#334155' : '#e2e8f0';
  const inputBg   = dark ? '#0f172a' : 'white';
  const inputBorder = dark ? '#475569' : '#cbd5e1';

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/doctors');
      setDoctors(res.data.doctors);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => { setEditDoctor(null); setForm(emptyForm); setShowModal(true); };

  const openEditModal = (doctor: Doctor) => {
    setEditDoctor(doctor);
    setForm({
      name: doctor.name, email: (doctor as any).email || '', speciality: doctor.speciality,
      experience: String(doctor.experience), availability: [...doctor.availability],
      consultationFee: String(doctor.consultationFee), qualification: doctor.qualification
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.speciality) {
      toast.error('Name and speciality are required');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        experience: Number(form.experience) || 0,
        consultationFee: Number(form.consultationFee) || 0
      };
      if (editDoctor) {
        await api.put(`/doctors/${editDoctor._id}`, payload);
        toast.success('Doctor updated successfully');
      } else {
        await api.post('/doctors', payload);
        toast.success('Doctor added successfully');
      }
      setShowModal(false);
      fetchDoctors();
    } catch (err: any) {
      toast.error(err.response?.data?.message || (editDoctor ? 'Failed to update doctor' : 'Failed to add doctor'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/doctors/${id}`);
      toast.success('Doctor deleted successfully');
      fetchDoctors();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete doctor');
    }
  };

  const toggleDay = (day: string) => {
    setForm(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day]
    }));
  };

  const filteredDoctors = doctors.filter(d => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.speciality.toLowerCase().includes(search.toLowerCase());
    const matchSpec = filterSpec === 'all' || d.speciality === filterSpec;
    return matchSearch && matchSpec;
  });

  const getSpecColor = (spec: string) => {
    const c = SPEC_COLORS[spec] || { bg: '#e0e7ff', text: '#3730a3', darkBg: '#312e81' };
    return dark ? { bg: c.darkBg, text: 'white' } : { bg: c.bg, text: c.text };
  };

  return (
    <div
      className="animate-fade-in min-h-screen transition-colors duration-300"
      style={{ backgroundColor: pageBg }}
    >
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Manage Doctors</h1>
          <p className="mt-1 text-sm" style={{ color: textSecondary }}>
            {filteredDoctors.length} of {doctors.length} doctors shown
          </p>
        </div>
        <button onClick={openAddModal} className="btn-primary self-start">
          <Plus className="w-5 h-5" /> Add Doctor
        </button>
      </div>

      {/* ── Search & Filter ── */}
      <div
        className="rounded-xl p-4 mb-6 shadow-sm"
        style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: textSecondary }} />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              className="input-field pl-9 text-sm" placeholder="Search by name or speciality..."
              style={{ backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }}
            />
          </div>
          <select
            value={filterSpec} onChange={e => setFilterSpec(e.target.value)}
            className="input-field sm:w-52 text-sm"
            style={{ backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }}
          >
            <option value="all">All Specialities</option>
            {SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* ── Doctor Cards ── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: '#0f4c75', borderTopColor: 'transparent' }}
          />
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div
          className="rounded-xl p-16 text-center shadow-sm"
          style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
        >
          <User className="w-16 h-16 mx-auto mb-4" style={{ color: dark ? '#475569' : '#cbd5e1' }} />
          <h3 className="text-lg font-semibold" style={{ color: textPrimary }}>No doctors found</h3>
          <p className="mt-1 text-sm" style={{ color: textSecondary }}>Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDoctors.map(doctor => {
            const sc = getSpecColor(doctor.speciality);
            return (
              <div
                key={doctor._id}
                className="rounded-xl shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden"
                style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
              >
                {/* Card top accent */}
                <div className="h-1.5" style={{ backgroundColor: sc.text === 'white' ? '#0f4c75' : sc.text }} />

                <div className="p-5">
                  {/* Doctor header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold"
                        style={{ backgroundColor: sc.bg, color: sc.text === 'white' ? '#0f4c75' : sc.text }}
                      >
                        {doctor.name.split(' ').find(w => w !== 'Dr.')?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm leading-tight" style={{ color: textPrimary }}>
                          {doctor.name}
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: textSecondary }}>
                          {doctor.qualification}
                        </p>
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => openEditModal(doctor)}
                        className="p-1.5 rounded-lg transition-colors"
                        title="Edit"
                        style={{ color: '#0f4c75' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = dark ? '#1e3a5f' : '#e0f2fe')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doctor._id, doctor.name)}
                        className="p-1.5 rounded-lg transition-colors"
                        title="Delete"
                        style={{ color: '#dc2626' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = dark ? '#450a0a' : '#fee2e2')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Speciality badge */}
                  <span
                    className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-4"
                    style={{ backgroundColor: sc.bg, color: sc.text === 'white' ? '#0f4c75' : sc.text }}
                  >
                    <Stethoscope className="w-3 h-3 inline mr-1" />
                    {doctor.speciality}
                  </span>

                  {/* Stats row */}
                  <div
                    className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-lg"
                    style={{ backgroundColor: dark ? '#0f172a' : '#f8fafc' }}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 flex-shrink-0" style={{ color: '#0f4c75' }} />
                      <div>
                        <p className="text-xs" style={{ color: textSecondary }}>Experience</p>
                        <p className="text-sm font-bold" style={{ color: textPrimary }}>
                          {doctor.experience} yrs
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 flex-shrink-0" style={{ color: '#059669' }} />
                      <div>
                        <p className="text-xs" style={{ color: textSecondary }}>Consult Fee</p>
                        <p className="text-sm font-bold" style={{ color: '#059669' }}>
                          ${doctor.consultationFee}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <p className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: textSecondary }}>
                      <Calendar className="w-3 h-3" /> Available Days
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {DAYS.map(day => {
                        const available = doctor.availability.includes(day);
                        return (
                          <span
                            key={day}
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: available
                                ? (dark ? '#064e3b' : '#d1fae5')
                                : (dark ? '#1e293b' : '#f1f5f9'),
                              color: available
                                ? (dark ? '#6ee7b7' : '#065f46')
                                : (dark ? '#475569' : '#94a3b8'),
                            }}
                          >
                            {day.slice(0, 3)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div
            className="relative rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in"
            style={{ backgroundColor: modalBg, border: `1px solid ${borderColor}` }}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between p-6 sticky top-0 rounded-t-2xl z-10"
              style={{ backgroundColor: modalBg, borderBottom: `1px solid ${borderColor}` }}
            >
              <div>
                <h2 className="text-xl font-bold" style={{ color: textPrimary }}>
                  {editDoctor ? 'Edit Doctor' : 'Add New Doctor'}
                </h2>
                <p className="text-sm mt-0.5" style={{ color: textSecondary }}>
                  {editDoctor ? 'Update doctor information' : 'Fill in the details below'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: textSecondary }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = dark ? '#334155' : '#f1f5f9')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name — required */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: textPrimary }}>
                  Full Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-field" placeholder="Dr. John Smith" required
                  style={{ backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }}
                />
              </div>

              {/* Email — required */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: textPrimary }}>
                  Email <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field" placeholder="doctor@clinic.com" required
                  style={{ backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }}
                />
              </div>

              {/* Speciality — required */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: textPrimary }}>
                  Speciality <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={form.speciality}
                  onChange={e => setForm({ ...form, speciality: e.target.value })}
                  className="input-field" required
                  style={{ backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }}
                >
                  <option value="">Select speciality</option>
                  {SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                  Availability
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button
                      key={day} type="button" onClick={() => toggleDay(day)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: form.availability.includes(day)
                          ? '#0f4c75'
                          : (dark ? '#334155' : '#f1f5f9'),
                        color: form.availability.includes(day)
                          ? 'white'
                          : textSecondary,
                      }}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button" onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {submitting
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Save className="w-4 h-4" />}
                  {editDoctor ? 'Update Doctor' : 'Add Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
