const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const PDFDocument = require('pdfkit');

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
const createAppointment = async (req, res) => {
  try {
    const { doctorId, speciality, date, time, reason } = req.body;

    if (!doctorId || !speciality || !date || !time || !reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      speciality,
      date,
      time,
      reason
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email')
      .populate('doctor', 'name speciality consultationFee');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get patient's appointments
// @route   GET /api/appointments/my
// @access  Private (Patient)
const getMyAppointments = async (req, res) => {
  try {
    const { status, sort } = req.query;
    
    let query = { patient: req.user._id };
    if (status && status !== 'all') {
      query.status = status;
    }

    let sortOption = { createdAt: -1 }; // default: latest
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'date') sortOption = { date: 1 };

    const appointments = await Appointment.find(query)
      .populate('doctor', 'name speciality consultationFee qualification')
      .sort(sortOption);

    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete appointment (patient - only completed/rejected)
// @route   DELETE /api/appointments/:id
// @access  Private (Patient)
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ 
      _id: req.params.id, 
      patient: req.user._id 
    });

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

// @desc    Download PDF receipt for completed appointment
// @route   GET /api/appointments/:id/receipt
// @access  Private (Patient)
const downloadReceipt = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ 
      _id: req.params.id, 
      patient: req.user._id,
      status: 'completed'
    })
      .populate('patient', 'name email phone')
      .populate('doctor', 'name speciality qualification');

    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Completed appointment not found' 
      });
    }

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${appointment.invoiceNumber || appointment._id}.pdf`);
    
    doc.pipe(res);

    // Header
    doc.rect(0, 0, 612, 120).fill('#1e40af');
    doc.fillColor('white')
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('MediCare Clinic', 50, 30);
    doc.fontSize(12)
       .font('Helvetica')
       .text('Professional Healthcare Services', 50, 65);
    doc.text('123 Health Street, Medical City | Tel: +1-800-MEDICARE', 50, 85);

    // Invoice title
    doc.fillColor('#1e40af')
       .fontSize(22)
       .font('Helvetica-Bold')
       .text('MEDICAL INVOICE', 50, 140);

    // Invoice details box
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

    // Divider
    doc.moveTo(50, 230).lineTo(562, 230).stroke('#e5e7eb');

    // Patient & Doctor Info
    doc.fillColor('#1e40af')
       .fontSize(13)
       .font('Helvetica-Bold')
       .text('PATIENT INFORMATION', 50, 250);

    doc.fillColor('#333')
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('Name:', 50, 275);
    doc.font('Helvetica')
       .text(appointment.patient.name, 130, 275);

    doc.font('Helvetica-Bold')
       .text('Email:', 50, 295);
    doc.font('Helvetica')
       .text(appointment.patient.email, 130, 295);

    doc.fillColor('#1e40af')
       .fontSize(13)
       .font('Helvetica-Bold')
       .text('DOCTOR INFORMATION', 320, 250);

    doc.fillColor('#333')
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('Doctor:', 320, 275);
    doc.font('Helvetica')
       .text(appointment.doctor.name, 400, 275);

    doc.font('Helvetica-Bold')
       .text('Speciality:', 320, 295);
    doc.font('Helvetica')
       .text(appointment.doctor.speciality, 400, 295);

    // Divider
    doc.moveTo(50, 325).lineTo(562, 325).stroke('#e5e7eb');

    // Appointment Details
    doc.fillColor('#1e40af')
       .fontSize(13)
       .font('Helvetica-Bold')
       .text('APPOINTMENT DETAILS', 50, 345);

    doc.fillColor('#333')
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('Date:', 50, 370);
    doc.font('Helvetica')
       .text(appointment.date, 130, 370);

    doc.font('Helvetica-Bold')
       .text('Time:', 50, 390);
    doc.font('Helvetica')
       .text(appointment.time, 130, 390);

    doc.font('Helvetica-Bold')
       .text('Reason:', 50, 410);
    doc.font('Helvetica')
       .text(appointment.reason, 130, 410, { width: 380 });

    // Prescription
    if (appointment.prescription) {
      doc.moveTo(50, 445).lineTo(562, 445).stroke('#e5e7eb');
      doc.fillColor('#1e40af')
         .fontSize(13)
         .font('Helvetica-Bold')
         .text('PRESCRIPTION', 50, 460);
      doc.fillColor('#333')
         .fontSize(11)
         .font('Helvetica')
         .text(appointment.prescription, 50, 485, { width: 512 });
    }

    // Medicine Notes
    if (appointment.medicineNotes) {
      const yPos = appointment.prescription ? 540 : 460;
      doc.fillColor('#1e40af')
         .fontSize(13)
         .font('Helvetica-Bold')
         .text('MEDICINE NOTES', 50, yPos);
      doc.fillColor('#333')
         .fontSize(11)
         .font('Helvetica')
         .text(appointment.medicineNotes, 50, yPos + 25, { width: 512 });
    }

    // Billing
    const billingY = 620;
    doc.rect(350, billingY, 212, 60).fill('#f0f9ff').stroke('#1e40af');
    doc.fillColor('#1e40af')
       .fontSize(13)
       .font('Helvetica-Bold')
       .text('CONSULTATION FEE', 360, billingY + 10);
    doc.fillColor('#1e40af')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text(`$${appointment.amount || 0}`, 360, billingY + 30);

    // Footer
    doc.rect(0, 750, 612, 92).fill('#f8fafc');
    doc.fillColor('#6b7280')
       .fontSize(10)
       .font('Helvetica')
       .text('Thank you for choosing MediCare Clinic. We wish you a speedy recovery!', 50, 765, { align: 'center', width: 512 });
    doc.text('For queries: support@medicare.com | www.medicare.com', 50, 785, { align: 'center', width: 512 });

    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createAppointment, getMyAppointments, deleteAppointment, downloadReceipt };
