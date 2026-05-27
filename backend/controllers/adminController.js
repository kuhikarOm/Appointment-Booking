const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const PDFDocument = require('pdfkit');

// @desc    Get all appointments (Admin)
// @route   GET /api/admin/appointments
// @access  Private (Admin)
const getAllAppointments = async (req, res) => {
  try {
    const { status, sort } = req.query;
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'date') sortOption = { date: 1 };

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name speciality consultationFee')
      .sort(sortOption);

    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment status (Admin)
// @route   PUT /api/admin/appointments/:id/status
// @access  Private (Admin)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('patient', 'name email').populate('doctor', 'name speciality');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, message: `Appointment ${status} successfully`, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Complete appointment with billing (Admin)
// @route   PUT /api/admin/appointments/:id/complete
// @access  Private (Admin)
const completeAppointment = async (req, res) => {
  try {
    const { prescription, medicineNotes, amount } = req.body;

    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'completed', 
        prescription, 
        medicineNotes, 
        amount: Number(amount) || 0,
        invoiceNumber
      },
      { new: true }
    ).populate('patient', 'name email phone').populate('doctor', 'name speciality qualification');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ 
      success: true, 
      message: 'Appointment completed with billing details', 
      appointment 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete appointment (Admin)
// @route   DELETE /api/admin/appointments/:id
// @access  Private (Admin)
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (!['completed', 'rejected'].includes(appointment.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only delete completed or rejected appointments' 
      });
    }

    await appointment.deleteOne();
    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard statistics (Admin)
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
  try {
    const [total, pending, approved, completed, rejected] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'approved' }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: 'rejected' })
    ]);

    // Calculate total revenue from completed appointments
    const revenueResult = await Appointment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const totalDoctors = await Doctor.countDocuments({ isActive: true });
    const totalPatients = await User.countDocuments({ role: 'patient' });

    // Recent appointments
    const recentAppointments = await Appointment.find()
      .populate('patient', 'name email')
      .populate('doctor', 'name speciality')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: { total, pending, approved, completed, rejected, revenue, totalDoctors, totalPatients },
      recentAppointments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate invoice PDF (Admin)
// @route   GET /api/admin/appointments/:id/invoice
// @access  Private (Admin)
const generateInvoice = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name speciality qualification');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${appointment.invoiceNumber || appointment._id}.pdf`);
    
    doc.pipe(res);

    // Header background
    doc.rect(0, 0, 612, 120).fill('#1e40af');
    doc.fillColor('white')
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('MediCare Clinic', 50, 30);
    doc.fontSize(12)
       .font('Helvetica')
       .text('Professional Healthcare Services', 50, 65);
    doc.text('123 Health Street, Medical City | Tel: +1-800-MEDICARE', 50, 85);

    doc.fillColor('#1e40af')
       .fontSize(22)
       .font('Helvetica-Bold')
       .text('MEDICAL INVOICE', 50, 140);

    doc.rect(350, 130, 210, 80).stroke('#1e40af');
    doc.fillColor('#333')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('Invoice Number:', 360, 145);
    doc.font('Helvetica')
       .text(appointment.invoiceNumber || `INV-${appointment._id.toString().slice(-8).toUpperCase()}`, 360, 160);
    doc.font('Helvetica-Bold')
       .text('Date:', 360, 178);
    doc.font('Helvetica')
       .text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 360, 193);

    doc.moveTo(50, 230).lineTo(562, 230).stroke('#e5e7eb');

    doc.fillColor('#1e40af').fontSize(13).font('Helvetica-Bold').text('PATIENT INFORMATION', 50, 250);
    doc.fillColor('#333').fontSize(11).font('Helvetica-Bold').text('Name:', 50, 275);
    doc.font('Helvetica').text(appointment.patient.name, 130, 275);
    doc.font('Helvetica-Bold').text('Email:', 50, 295);
    doc.font('Helvetica').text(appointment.patient.email, 130, 295);

    doc.fillColor('#1e40af').fontSize(13).font('Helvetica-Bold').text('DOCTOR INFORMATION', 320, 250);
    doc.fillColor('#333').fontSize(11).font('Helvetica-Bold').text('Doctor:', 320, 275);
    doc.font('Helvetica').text(appointment.doctor.name, 400, 275);
    doc.font('Helvetica-Bold').text('Speciality:', 320, 295);
    doc.font('Helvetica').text(appointment.doctor.speciality, 400, 295);

    doc.moveTo(50, 325).lineTo(562, 325).stroke('#e5e7eb');

    doc.fillColor('#1e40af').fontSize(13).font('Helvetica-Bold').text('APPOINTMENT DETAILS', 50, 345);
    doc.fillColor('#333').fontSize(11).font('Helvetica-Bold').text('Date:', 50, 370);
    doc.font('Helvetica').text(appointment.date, 130, 370);
    doc.font('Helvetica-Bold').text('Time:', 50, 390);
    doc.font('Helvetica').text(appointment.time, 130, 390);
    doc.font('Helvetica-Bold').text('Reason:', 50, 410);
    doc.font('Helvetica').text(appointment.reason, 130, 410, { width: 380 });

    if (appointment.prescription) {
      doc.moveTo(50, 445).lineTo(562, 445).stroke('#e5e7eb');
      doc.fillColor('#1e40af').fontSize(13).font('Helvetica-Bold').text('PRESCRIPTION', 50, 460);
      doc.fillColor('#333').fontSize(11).font('Helvetica').text(appointment.prescription, 50, 485, { width: 512 });
    }

    if (appointment.medicineNotes) {
      const yPos = appointment.prescription ? 540 : 460;
      doc.fillColor('#1e40af').fontSize(13).font('Helvetica-Bold').text('MEDICINE NOTES', 50, yPos);
      doc.fillColor('#333').fontSize(11).font('Helvetica').text(appointment.medicineNotes, 50, yPos + 25, { width: 512 });
    }

    const billingY = 620;
    doc.rect(350, billingY, 212, 60).fill('#f0f9ff').stroke('#1e40af');
    doc.fillColor('#1e40af').fontSize(13).font('Helvetica-Bold').text('CONSULTATION FEE', 360, billingY + 10);
    doc.fillColor('#1e40af').fontSize(20).font('Helvetica-Bold').text(`$${appointment.amount || 0}`, 360, billingY + 30);

    doc.rect(0, 750, 612, 92).fill('#f8fafc');
    doc.fillColor('#6b7280').fontSize(10).font('Helvetica')
       .text('Thank you for choosing MediCare Clinic. We wish you a speedy recovery!', 50, 765, { align: 'center', width: 512 });
    doc.text('For queries: support@medicare.com | www.medicare.com', 50, 785, { align: 'center', width: 512 });

    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  getAllAppointments, 
  updateAppointmentStatus, 
  completeAppointment, 
  deleteAppointment, 
  getDashboardStats,
  generateInvoice
};
