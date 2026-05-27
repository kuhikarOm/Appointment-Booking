const express = require('express');
const router = express.Router();
const { 
  getAllAppointments, 
  updateAppointmentStatus, 
  completeAppointment, 
  deleteAppointment, 
  getDashboardStats,
  generateInvoice
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly); // All admin routes require admin auth

router.get('/stats', getDashboardStats);
router.get('/appointments', getAllAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);
router.put('/appointments/:id/complete', completeAppointment);
router.delete('/appointments/:id', deleteAppointment);
router.get('/appointments/:id/invoice', generateInvoice);

module.exports = router;
