const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  provider: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Pre-Matric', 'Post-Matric', 'Higher Education', 'Girls Education', 'Merit-Based', 'Technical / Vocational'],
    default: 'Post-Matric'
  },
  eligibility: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  deadline: {
    type: String,
    required: true
  },
  applicationLink: {
    type: String,
    default: 'https://scholarships.gov.in'
  },
  description: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Scholarship', scholarshipSchema);
