const Doctor = require('../models/Doctor');

// @desc    Get all doctors (optionally filter by speciality)
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
  try {
    const { speciality } = req.query;
    let query = { isActive: true };

    if (speciality) {
      // Case-insensitive match so "Orthopedic" and "Orthopedist" both work
      query.speciality = { $regex: new RegExp(`^${speciality}$`, 'i') };
    }

    const doctors = await Doctor.find(query).sort({ name: 1 });
    res.json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
const getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add new doctor — only name, email, speciality required
// @route   POST /api/doctors
// @access  Private (Admin)
const addDoctor = async (req, res) => {
  try {
    const {
      name, email, speciality,
      experience, availability, consultationFee, qualification
    } = req.body;

    if (!name || !speciality) {
      return res.status(400).json({
        success: false,
        message: 'Name and speciality are required'
      });
    }

    const doctor = await Doctor.create({
      name,
      email: email || '',
      speciality,
      experience: experience || 0,
      availability: availability || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      consultationFee: consultationFee || 0,
      qualification: qualification || 'MBBS'
    });

    res.status(201).json({
      success: true,
      message: 'Doctor added successfully',
      doctor
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Private (Admin)
const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: false }
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({ success: true, message: 'Doctor updated successfully', doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Private (Admin)
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDoctors, getDoctor, addDoctor, updateDoctor, deleteDoctor };
