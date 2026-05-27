const express = require('express');
const router = express.Router();
const { getDoctors, getDoctor, addDoctor, updateDoctor, deleteDoctor } = require('../controllers/doctorController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getDoctors);
router.get('/:id', getDoctor);
router.post('/', protect, adminOnly, addDoctor);
router.put('/:id', protect, adminOnly, updateDoctor);
router.delete('/:id', protect, adminOnly, deleteDoctor);

module.exports = router;
