require('dotenv').config();
const mongoose = require('mongoose');
const initialData = require('./data/initialData');
const UserModel = require('./models/User');
const SchemeModel = require('./models/Scheme');
const ScholarshipModel = require('./models/Scholarship');
const AgricultureModel = require('./models/Agriculture');
const NotificationModel = require('./models/Notification');
const fs = require('fs');
const path = require('path');

async function seedDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rural_platform';
  console.log('Seeding database...');

  // 1. Also update data/db.json
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbJson = {
    users: [...initialData.initialUsers],
    schemes: [...initialData.initialSchemes],
    scholarships: [...initialData.initialScholarships],
    agriculture: [...initialData.initialAgriculture],
    documents: [],
    notifications: [...initialData.initialNotifications]
  };
  fs.writeFileSync(path.join(dataDir, 'db.json'), JSON.stringify(dbJson, null, 2), 'utf8');
  console.log(' Local JSON data store (data/db.json) seeded successfully.');

  // 2. If MongoDB is available, seed MongoDB too
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    console.log(' Connected to MongoDB. Purging existing collections & seeding...');
    await UserModel.deleteMany({});
    await SchemeModel.deleteMany({});
    await ScholarshipModel.deleteMany({});
    await AgricultureModel.deleteMany({});
    await NotificationModel.deleteMany({});

    await UserModel.insertMany(initialData.initialUsers);
    await SchemeModel.insertMany(initialData.initialSchemes);
    await ScholarshipModel.insertMany(initialData.initialScholarships);
    await AgricultureModel.insertMany(initialData.initialAgriculture);
    await NotificationModel.insertMany(initialData.initialNotifications);

    console.log(' MongoDB collections successfully refreshed with seed data!');
    await mongoose.disconnect();
  } catch (err) {
    console.log(' Note: MongoDB not reachable (' + err.message + '). Local JSON store was seeded.');
  }

  console.log('Done! Demo accounts:');
  console.log('  Citizen: citizen@rural.gov / citizen123');
  console.log('  Admin:   admin@rural.gov / admin123');
  process.exit(0);
}

seedDatabase();
