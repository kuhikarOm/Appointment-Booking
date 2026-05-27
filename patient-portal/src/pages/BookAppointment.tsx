import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { Calendar, Clock, Stethoscope, FileText, ChevronDown, User, CheckCircle, Star, DollarSign } from 'lucide-react';

const SPECIALITIES = [
  'Cardiologist', 'Neurologist', 'Orthopedic', 'Dermatologist',
  'Pediatrician', 'Gynecologist', 'Psychiatrist', 'Ophthalmologist',
  'ENT Specialist', 'General Physician', 'Dentist'
];

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
];

interface Doctor {
  _id: string;
  name: string;
  speciality: string;
  experience: number;
  consultationFee: number;
  qualification: string;
  availability: string[];
}

const BookAppointment = () => {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [form, setForm] = useState({ speciality: '', doctorId: '', date: '', time: '', reason: '' });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingDoctors, setFetchingDoctors] = useState(false);

  const cardBg = dark ? '#1e293b' : 'white';
  const pageBg = dark ? '#0f172a' : '#f0fdf4';
  const textPrimary = dark ? '#f1f5f9' : '#111827';
  const textSecondary = dark ? '#94a3b8' : '#6b7280';
  const borderColor = dark ? '#334155' : '#e5e7eb';
  const inputBg = dark ? '#0f172a' : 'white';
  const inputBorder = dark ? '#475569' : '#d1d5db';

  useEffect(() => {
    if (form.speciality) {
      fetchDoctors(form.speciality);
      setForm(prev => ({ ...prev, doctorId: '' }));
      setSelectedDoctor(null);
    }
  }, [form.speciality]);

  const fetchDoctors = async (speciality: string) => {
    setFetchingDoctors(true);
    try {
      const res = await api.get(`/doctors?speciality=${encodeURIComponent(speciality)}`);
      setDoctors(res.data.doctors);
    } catch {
      toast.error('Failed to load doctors');
    } finally {
      setFetchingDoctors(false);
    }
  };

  const selectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setForm(prev => ({ ...prev, doctorId: doctor._id }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.speciality || !form.doctorId || !form.date || !form.time || !form.reason) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/appointments', form);
      toast.success('Appointment booked successfully!');
      navigate('/my-appointments');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: pageBg }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Book an Appointment</h1>
          <p className="mt-1" style={{ color: textSecondary }}>Fill in the details to schedule your visit</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Speciality */}
          <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
            <label className="block text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: textPrimary }}>
              <Stethoscope className="w-4 h-4" style={{ color: '#059669' }} /> Select Speciality *
            </label>
            <div className="relative">
              <select name="speciality" value={form.speciality} onChange={handleChange}
                className="input-field appearance-none pr-10"
                style={{ backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }} required>
                <option value="">Choose a speciality</option>
                {SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: textSecondary }} />
            </div>
          </div>

          {/* Doctor Cards */}
          {form.speciality && (
            <div className="rounded-xl p-6 shadow-sm animate-fade-in" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
              <label className="block text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: textPrimary }}>
                <User className="w-4 h-4" style={{ color: '#059669' }} />
                Available Doctors for {form.speciality}
              </label>

              {fetchingDoctors ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#059669', borderTopColor: 'transparent' }}></div>
                  <span className="ml-3 text-sm" style={{ color: textSecondary }}>Loading doctors...</span>
                </div>
              ) : doctors.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 mx-auto mb-2" style={{ color: dark ? '#475569' : '#d1d5db' }} />
                  <p className="text-sm" style={{ color: textSecondary }}>No doctors available for this speciality</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {doctors.map(doctor => {
                    const isSelected = selectedDoctor?._id === doctor._id;
                    return (
                      <button key={doctor._id} type="button" onClick={() => selectDoctor(doctor)}
                        className="text-left p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md"
                        style={{
                          backgroundColor: isSelected ? (dark ? '#064e3b' : '#ecfdf5') : (dark ? '#0f172a' : '#f9fafb'),
                          borderColor: isSelected ? '#059669' : (dark ? '#334155' : '#e5e7eb'),
                        }}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: isSelected ? '#059669' : (dark ? '#1e293b' : '#d1fae5') }}>
                              <User className="w-5 h-5" style={{ color: isSelected ? 'white' : '#059669' }} />
                            </div>
                            <div>
                              <p className="font-semibold text-sm" style={{ color: isSelected ? '#059669' : textPrimary }}>{doctor.name}</p>
                              <p className="text-xs mt-0.5" style={{ color: textSecondary }}>{doctor.qualification}</p>
                            </div>
                          </div>
                          {isSelected && <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#059669' }} />}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                            style={{ backgroundColor: dark ? '#1e293b' : '#f3f4f6', color: textSecondary }}>
                            <Star className="w-3 h-3" /> {doctor.experience} yrs exp
                          </span>
                          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                            style={{ backgroundColor: dark ? '#1e293b' : '#f3f4f6', color: textSecondary }}>
                            <DollarSign className="w-3 h-3" /> ${doctor.consultationFee}
                          </span>
                        </div>

                        <div className="mt-2">
                          <p className="text-xs" style={{ color: textSecondary }}>
                            📅 {doctor.availability.map(d => d.slice(0, 3)).join(', ')}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Date & Time */}
          {selectedDoctor && (
            <div className="rounded-xl p-6 shadow-sm animate-fade-in" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: textPrimary }}>
                    <Calendar className="w-4 h-4" style={{ color: '#059669' }} /> Date *
                  </label>
                  <input type="date" name="date" value={form.date} onChange={handleChange}
                    min={today} className="input-field" required
                    style={{ backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: textPrimary }}>
                    <Clock className="w-4 h-4" style={{ color: '#059669' }} /> Time *
                  </label>
                  <div className="relative">
                    <select name="time" value={form.time} onChange={handleChange}
                      className="input-field appearance-none pr-10" required
                      style={{ backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }}>
                      <option value="">Select time slot</option>
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: textSecondary }} />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: textPrimary }}>
                  <FileText className="w-4 h-4" style={{ color: '#059669' }} /> Reason for Visit *
                </label>
                <textarea name="reason" value={form.reason} onChange={handleChange} rows={4}
                  className="input-field resize-none"
                  placeholder="Describe your symptoms or reason for the appointment..."
                  required style={{ backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }} />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading || !selectedDoctor}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Booking...</>
              ) : (
                <><Calendar className="w-4 h-4" />Book Appointment</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
