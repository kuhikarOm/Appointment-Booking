const Doctor = require('../models/Doctor');
const User = require('../models/User');

// ── Doctors from the provided dataset ──────────────────────────────────────
// Fields mapped: specialty → speciality, available → isActive
// Missing fields (experience, consultationFee, qualification) get sensible defaults
const doctorsData = [
  // General Physician
  { name: 'Dr. Sarah Smith',       email: 'sarah.smith@clinic.com',       speciality: 'General Physician', experience: 8,  consultationFee: 80,  qualification: 'MBBS, MD', availability: ['Monday','Tuesday','Wednesday','Thursday','Friday'] },
  { name: 'Dr. John Doe',          email: 'john.doe@clinic.com',          speciality: 'General Physician', experience: 10, consultationFee: 80,  qualification: 'MBBS, MD', availability: ['Monday','Tuesday','Wednesday','Thursday','Friday'] },
  { name: 'Dr. Alice Williams',    email: 'alice.williams@clinic.com',    speciality: 'General Physician', experience: 12, consultationFee: 85,  qualification: 'MBBS, MD', availability: ['Monday','Wednesday','Friday'] },
  { name: 'Dr. Robert Taylor',     email: 'robert.taylor@clinic.com',     speciality: 'General Physician', experience: 15, consultationFee: 90,  qualification: 'MBBS, MD', availability: ['Tuesday','Thursday','Saturday'] },

  // Cardiologist
  { name: 'Dr. Emily Chen',        email: 'emily.chen@clinic.com',        speciality: 'Cardiologist', experience: 14, consultationFee: 150, qualification: 'MBBS, MD (Cardiology)', availability: ['Monday','Tuesday','Wednesday','Thursday','Friday'] },
  { name: 'Dr. Michael Brown',     email: 'michael.brown@clinic.com',     speciality: 'Cardiologist', experience: 18, consultationFee: 160, qualification: 'MBBS, DM (Cardiology)', availability: ['Monday','Wednesday','Friday'] },
  { name: 'Dr. William Davis',     email: 'william.davis@clinic.com',     speciality: 'Cardiologist', experience: 20, consultationFee: 170, qualification: 'MBBS, MD, DM', availability: ['Tuesday','Thursday','Saturday'] },
  { name: 'Dr. Susan Wilson',      email: 'susan.wilson@clinic.com',      speciality: 'Cardiologist', experience: 11, consultationFee: 140, qualification: 'MBBS, MD (Cardiology)', availability: ['Monday','Tuesday','Friday'] },

  // Dermatologist
  { name: 'Dr. Lisa Thompson',     email: 'lisa.thompson@clinic.com',     speciality: 'Dermatologist', experience: 10, consultationFee: 120, qualification: 'MBBS, MD (Dermatology)', availability: ['Monday','Tuesday','Wednesday'] },
  { name: 'Dr. Betty Garcia',      email: 'betty.garcia@clinic.com',      speciality: 'Dermatologist', experience: 13, consultationFee: 130, qualification: 'MBBS, DVD', availability: ['Tuesday','Thursday','Friday'] },
  { name: 'Dr. Dorothy Martinez',  email: 'dorothy.martinez@clinic.com',  speciality: 'Dermatologist', experience: 7,  consultationFee: 110, qualification: 'MBBS, MD (Skin)', availability: ['Monday','Wednesday','Saturday'] },
  { name: 'Dr. Om Kuhikar',        email: '',                             speciality: 'Dermatologist', experience: 20, consultationFee: 1000, qualification: 'MBBS, MD', availability: ['Monday','Tuesday','Wednesday','Thursday','Friday'] },

  // Pediatrician
  { name: 'Dr. Jessica Jones',     email: 'jessica.jones@clinic.com',     speciality: 'Pediatrician', experience: 9,  consultationFee: 100, qualification: 'MBBS, DCH', availability: ['Monday','Tuesday','Thursday'] },
  { name: 'Dr. David Moore',       email: 'david.moore@clinic.com',       speciality: 'Pediatrician', experience: 16, consultationFee: 110, qualification: 'MBBS, MD (Pediatrics)', availability: ['Wednesday','Friday','Saturday'] },
  { name: 'Dr. Margaret Anderson', email: 'margaret.anderson@clinic.com', speciality: 'Pediatrician', experience: 12, consultationFee: 105, qualification: 'MBBS, DCH, MD', availability: ['Monday','Wednesday','Friday'] },
  { name: 'Dr. Charles Thomas',    email: 'charles.thomas@clinic.com',    speciality: 'Pediatrician', experience: 8,  consultationFee: 95,  qualification: 'MBBS, DCH', availability: ['Tuesday','Thursday','Saturday'] },

  // Orthopedic
  { name: 'Dr. Robert Wilson',     email: 'robert.wilson@clinic.com',     speciality: 'Orthopedic', experience: 17, consultationFee: 140, qualification: 'MBBS, MS (Ortho)', availability: ['Monday','Tuesday','Thursday'] },
  { name: 'Dr. Christopher Jackson', email: 'chris.jackson@clinic.com',   speciality: 'Orthopedic', experience: 14, consultationFee: 130, qualification: 'MBBS, MS (Ortho)', availability: ['Wednesday','Friday','Saturday'] },
  { name: 'Dr. Daniel White',      email: 'daniel.white@clinic.com',      speciality: 'Orthopedic', experience: 22, consultationFee: 160, qualification: 'MBBS, MS, MCh', availability: ['Monday','Wednesday','Friday'] },

  // Neurologist
  { name: 'Dr. Mark Rodriguez',    email: 'mark.rodriguez@clinic.com',    speciality: 'Neurologist', experience: 16, consultationFee: 160, qualification: 'MBBS, MD (Neurology)', availability: ['Monday','Tuesday','Wednesday'] },
  { name: 'Dr. Paul Lewis',        email: 'paul.lewis@clinic.com',        speciality: 'Neurologist', experience: 19, consultationFee: 170, qualification: 'MBBS, DM (Neurology)', availability: ['Tuesday','Thursday','Friday'] },
  { name: 'Dr. Steven Lee',        email: 'steven.lee@clinic.com',        speciality: 'Neurologist', experience: 11, consultationFee: 145, qualification: 'MBBS, MD (Neurology)', availability: ['Monday','Wednesday','Friday'] },
  { name: 'Dr. Andrew Walker',     email: 'andrew.walker@clinic.com',     speciality: 'Neurologist', experience: 13, consultationFee: 155, qualification: 'MBBS, DM', availability: ['Tuesday','Wednesday','Saturday'] },

  // Dentist
  { name: 'Dr. Joshua Allen',      email: 'joshua.allen@clinic.com',      speciality: 'Dentist', experience: 8,  consultationFee: 90,  qualification: 'BDS, MDS', availability: ['Monday','Tuesday','Wednesday','Thursday','Friday'] },
  { name: 'Dr. Kevin Young',       email: 'kevin.young@clinic.com',       speciality: 'Dentist', experience: 12, consultationFee: 100, qualification: 'BDS, MDS', availability: ['Monday','Wednesday','Friday'] },
  { name: 'Dr. Brian Hernandez',   email: 'brian.hernandez@clinic.com',   speciality: 'Dentist', experience: 6,  consultationFee: 85,  qualification: 'BDS', availability: ['Tuesday','Thursday','Saturday'] },

  // ENT Specialist
  { name: 'Dr. Patricia Harris',   email: 'patricia.harris@clinic.com',   speciality: 'ENT Specialist', experience: 15, consultationFee: 130, qualification: 'MBBS, MS (ENT)', availability: ['Monday','Tuesday','Thursday'] },
  { name: 'Dr. James Martin',      email: 'james.martin@clinic.com',      speciality: 'ENT Specialist', experience: 10, consultationFee: 120, qualification: 'MBBS, DLO', availability: ['Wednesday','Friday','Saturday'] },
  { name: 'Dr. Linda Jackson',     email: 'linda.jackson@clinic.com',     speciality: 'ENT Specialist', experience: 18, consultationFee: 145, qualification: 'MBBS, MS (ENT)', availability: ['Monday','Wednesday','Friday'] },

  // Psychiatrist
  { name: 'Dr. Barbara Thompson',  email: 'barbara.thompson@clinic.com',  speciality: 'Psychiatrist', experience: 13, consultationFee: 160, qualification: 'MBBS, MD (Psychiatry)', availability: ['Monday','Tuesday','Thursday'] },
  { name: 'Dr. Richard Garcia',    email: 'richard.garcia@clinic.com',    speciality: 'Psychiatrist', experience: 17, consultationFee: 175, qualification: 'MBBS, MD (Psychiatry)', availability: ['Wednesday','Friday','Saturday'] },
  { name: 'Dr. Mary Martinez',     email: 'mary.martinez@clinic.com',     speciality: 'Psychiatrist', experience: 9,  consultationFee: 140, qualification: 'MBBS, DPM', availability: ['Monday','Wednesday','Friday'] },
  { name: 'Dr. Joseph Robinson',   email: 'joseph.robinson@clinic.com',   speciality: 'Psychiatrist', experience: 11, consultationFee: 150, qualification: 'MBBS, DPM', availability: ['Tuesday','Thursday','Saturday'] },

  // Gynecologist
  { name: 'Dr. Sandra Clark',      email: 'sandra.clark@clinic.com',      speciality: 'Gynecologist', experience: 16, consultationFee: 150, qualification: 'MBBS, MS (OBG)', availability: ['Monday','Tuesday','Wednesday'] },
  { name: 'Dr. Ashley Lewis',      email: 'ashley.lewis@clinic.com',      speciality: 'Gynecologist', experience: 11, consultationFee: 130, qualification: 'MBBS, DGO', availability: ['Tuesday','Thursday','Friday'] },
  { name: 'Dr. Donna Lee',         email: 'donna.lee@clinic.com',         speciality: 'Gynecologist', experience: 20, consultationFee: 170, qualification: 'MBBS, MS, DNB', availability: ['Monday','Wednesday','Saturday'] },
];

const seedDoctors = async () => {
  try {
    // Clear old doctors and re-seed with the new dataset
    const doctorCount = await Doctor.countDocuments();
    if (doctorCount === 0) {
      await Doctor.insertMany(doctorsData);
      console.log(`✅ ${doctorsData.length} doctors seeded successfully`);
    } else {
      console.log(`ℹ️  Doctors already exist (${doctorCount}), skipping seed`);
    }

    // Create default admin if not exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await User.collection.insertOne({
        name: 'Admin',
        email: 'admin@medicare.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date()
      });
      console.log('✅ Default admin created: admin@medicare.com / admin123');
    }
  } catch (error) {
    console.error('Seed error:', error.message);
  }
};

module.exports = { seedDoctors };
