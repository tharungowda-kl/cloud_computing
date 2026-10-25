const mongoose = require('mongoose');

const agricultureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Crop Management', 'Irrigation Methods', 'Soil Health & Fertilizer', 'Pest & Disease Control', 'Modern Tools & Subsidies'],
    default: 'Crop Management'
  },
  cropType: {
    type: String,
    default: 'General'
  },
  season: {
    type: String,
    default: 'All Seasons'
  },
  summary: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  tips: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Agriculture', agricultureSchema);
