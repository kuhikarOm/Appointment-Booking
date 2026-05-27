const express = require('express');
const router = express.Router();
const { 
  createAppointment, 
  getMyAppointments, 
  deleteAppointment, 
  downloadReceipt 
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

router.use(protect); // All appointment routes require authentication

router.post('/', createAppointment);
router.get('/my', getMyAppointments);
router.delete('/:id', deleteAppointment);
router.get('/:id/receipt', downloadReceipt);

module.exports = router;
