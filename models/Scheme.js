const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Agriculture', 'Healthcare', 'Housing', 'Employment', 'Social Welfare', 'Financial Support'],
    default: 'Agriculture'
  },
  description: {
    type: String,
    required: true
  },
  eligibility: {
    type: String,
    required: true
  },
  benefits: {
    type: String,
    required: true
  },
  applicationLink: {
    type: String,
    default: 'https://services.india.gov.in'
  },
  documentsRequired: {
    type: [String],
    default: ['Aadhaar Card', 'Bank Passbook', 'Land Record / RTC']
  },
  deadline: {
    type: String,
    default: 'Open Round the Year'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Scheme', schemeSchema);
