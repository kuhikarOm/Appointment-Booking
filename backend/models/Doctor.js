const mongoose = require('mongoose');

const SPECIALITIES = [
  'Cardiologist',
  'Neurologist',
  'Orthopedic',
  'Orthopedist',
  'Dermatologist',
  'Pediatrician',
  'Gynecologist',
  'Psychiatrist',
  'Ophthalmologist',
  'ENT Specialist',
  'General Physician',
  'Dentist'
];

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  speciality: {
    type: String,
    required: [true, 'Speciality is required'],
    trim: true
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  availability: {
    type: [String],
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  consultationFee: {
    type: Number,
    default: 0,
    min: 0
  },
  qualification: {
    type: String,
    default: 'MBBS'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);
