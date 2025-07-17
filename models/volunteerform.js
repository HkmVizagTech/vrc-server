const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  whatsappNumber: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  maritalStatus: { type: String, enum: ['Single', 'Married'] },
  profession: { type: String, enum: ['Student', 'Working', 'Job Trails', 'Business', 'Others'] },
  collegeOrCompany: { type: String },
  locality: { type: String },
  referredBy: { type: String, enum: [
  'Sitanatha Dasa',
  'Rama Dasa',
  'Gauranga Dasa',
  'mani teja prabhu',
  'Not associated',
  'Niskinchana Bhakta Dasa',
  'Yaduraja Dasa',
  'Vaikunteswara Dasa',
  'Ambarisha Dasa',
  'Sruthisagar Dasa',
  'Shyam Mashav Dasa',
  'Jitaamitra Dasa',
  'Keshav Kripa Dasa',
  'Gopeswara Dasa',
  'Adhokshaja Dasa',
  'Ranveer Rama Dasa',
  'Gadadhara Dasa',
  'Shadgoswami Dasa',
  'Ishan Krishna Dasa',
  'Others'
]
 },
  infoSource: { type: String, enum: ['Whatsapp Group', 'Instagram', 'Facebook', 'Friends Reference', 'Other'] },
  serviceAvailability: [
    {
      date: { type: String },
      timeSlot: { type: String, enum: ['Full Day', 'Half Day 2pm', 'Half Day 4pm', 'Not Possible'] }
    }
  ],
  tshirtSize: { type: String, enum: ['XL', 'L', 'M', 'S', ''] },
  needAccommodation: { type: String, enum: ['Yes', 'No'] },
  imageUrl: { type: String }, 
  assignedService: { type: mongoose.Schema.Types.ObjectId, ref: 'servicecoordinator', default: null },
}, { timestamps: true });

module.exports = mongoose.model('volunteer', volunteerSchema);
