const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    default: 'Citizen'
  },
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    default: 'application/octet-stream'
  },
  category: {
    type: String,
    enum: ['Aadhaar Card', 'Ration Card', 'Land Record / RTC', 'Income Certificate', 'Caste Certificate', 'Bank Passbook', 'Other'],
    default: 'Other'
  },
  storageProvider: {
    type: String,
    enum: ['local', 's3'],
    default: 'local'
  },
  s3Key: {
    type: String,
    default: ''
  },
  filePath: {
    type: String,
    default: ''
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Document', documentSchema);
