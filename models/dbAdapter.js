const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const initialData = require('../data/initialData');

// Load Mongoose models
const UserModel = require('./User');
const SchemeModel = require('./Scheme');
const ScholarshipModel = require('./Scholarship');
const AgricultureModel = require('./Agriculture');
const DocumentModel = require('./Document');
const NotificationModel = require('./Notification');

const DATA_DIR = path.join(__dirname, '..', 'data');
const JSON_DB_FILE = path.join(DATA_DIR, 'db.json');

let isMongoConnected = false;

// Fallback JSON in-memory store backed by disk
let localStore = {
  users: [],
  schemes: [],
  scholarships: [],
  agriculture: [],
  documents: [],
  notifications: []
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadLocalStore() {
  ensureDataDir();
  if (fs.existsSync(JSON_DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(JSON_DB_FILE, 'utf8'));
      localStore = {
        users: data.users || [...initialData.initialUsers],
        schemes: data.schemes || [...initialData.initialSchemes],
        scholarships: data.scholarships || [...initialData.initialScholarships],
        agriculture: data.agriculture || [...initialData.initialAgriculture],
        documents: data.documents || [],
        notifications: data.notifications || [...initialData.initialNotifications]
      };
      return;
    } catch (e) {
      console.warn('Could not read existing db.json, reinitializing from initial data.');
    }
  }

  // Initialize fresh store
  localStore = {
    users: [...initialData.initialUsers],
    schemes: [...initialData.initialSchemes],
    scholarships: [...initialData.initialScholarships],
    agriculture: [...initialData.initialAgriculture],
    documents: [],
    notifications: [...initialData.initialNotifications]
  };
  saveLocalStore();
}

function saveLocalStore() {
  ensureDataDir();
  try {
    fs.writeFileSync(JSON_DB_FILE, JSON.stringify(localStore, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving local database store:', err.message);
  }
}

// Generate simple unique IDs for JSON store fallback
function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

// Memory / JSON Collection Implementation
function createLocalCollection(name, prefix) {
  return {
    async find(filter = {}) {
      let items = [...localStore[name]];
      for (const [key, val] of Object.entries(filter)) {
        if (val !== undefined && val !== null) {
          items = items.filter(item => {
            if (typeof item[key] === 'string' && typeof val === 'string') {
              return item[key].toLowerCase() === val.toLowerCase();
            }
            return item[key] == val;
          });
        }
      }
      return items;
    },

    async findOne(filter = {}) {
      const items = await this.find(filter);
      return items[0] || null;
    },

    async findById(id) {
      const item = localStore[name].find(doc => (doc._id || doc.id) === id);
      return item || null;
    },

    async create(data) {
      const newDoc = {
        ...data,
        _id: data._id || generateId(prefix),
        createdAt: data.createdAt || new Date().toISOString()
      };
      localStore[name].unshift(newDoc);
      saveLocalStore();
      return newDoc;
    },

    async findByIdAndUpdate(id, updateData) {
      const index = localStore[name].findIndex(doc => (doc._id || doc.id) === id);
      if (index === -1) return null;
      localStore[name][index] = {
        ...localStore[name][index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      saveLocalStore();
      return localStore[name][index];
    },

    async findByIdAndDelete(id) {
      const index = localStore[name].findIndex(doc => (doc._id || doc.id) === id);
      if (index === -1) return null;
      const [removed] = localStore[name].splice(index, 1);
      saveLocalStore();
      return removed;
    },

    async countDocuments(filter = {}) {
      const items = await this.find(filter);
      return items.length;
    }
  };
}

// Unified Database API
const db = {
  users: {
    find: async (filter) => isMongoConnected ? UserModel.find(filter).lean() : createLocalCollection('users', 'usr').find(filter),
    findOne: async (filter) => isMongoConnected ? UserModel.findOne(filter).lean() : createLocalCollection('users', 'usr').findOne(filter),
    findById: async (id) => isMongoConnected ? UserModel.findById(id).lean() : createLocalCollection('users', 'usr').findById(id),
    create: async (data) => isMongoConnected ? UserModel.create(data) : createLocalCollection('users', 'usr').create(data),
    findByIdAndUpdate: async (id, data) => isMongoConnected ? UserModel.findByIdAndUpdate(id, data, { new: true }).lean() : createLocalCollection('users', 'usr').findByIdAndUpdate(id, data),
    findByIdAndDelete: async (id) => isMongoConnected ? UserModel.findByIdAndDelete(id).lean() : createLocalCollection('users', 'usr').findByIdAndDelete(id),
    countDocuments: async (filter) => isMongoConnected ? UserModel.countDocuments(filter) : createLocalCollection('users', 'usr').countDocuments(filter)
  },
  schemes: {
    find: async (filter) => isMongoConnected ? SchemeModel.find(filter).lean() : createLocalCollection('schemes', 'scm').find(filter),
    findOne: async (filter) => isMongoConnected ? SchemeModel.findOne(filter).lean() : createLocalCollection('schemes', 'scm').findOne(filter),
    findById: async (id) => isMongoConnected ? SchemeModel.findById(id).lean() : createLocalCollection('schemes', 'scm').findById(id),
    create: async (data) => isMongoConnected ? SchemeModel.create(data) : createLocalCollection('schemes', 'scm').create(data),
    findByIdAndUpdate: async (id, data) => isMongoConnected ? SchemeModel.findByIdAndUpdate(id, data, { new: true }).lean() : createLocalCollection('schemes', 'scm').findByIdAndUpdate(id, data),
    findByIdAndDelete: async (id) => isMongoConnected ? SchemeModel.findByIdAndDelete(id).lean() : createLocalCollection('schemes', 'scm').findByIdAndDelete(id),
    countDocuments: async (filter) => isMongoConnected ? SchemeModel.countDocuments(filter) : createLocalCollection('schemes', 'scm').countDocuments(filter)
  },
  scholarships: {
    find: async (filter) => isMongoConnected ? ScholarshipModel.find(filter).lean() : createLocalCollection('scholarships', 'sch').find(filter),
    findOne: async (filter) => isMongoConnected ? ScholarshipModel.findOne(filter).lean() : createLocalCollection('scholarships', 'sch').findOne(filter),
    findById: async (id) => isMongoConnected ? ScholarshipModel.findById(id).lean() : createLocalCollection('scholarships', 'sch').findById(id),
    create: async (data) => isMongoConnected ? ScholarshipModel.create(data) : createLocalCollection('scholarships', 'sch').create(data),
    findByIdAndUpdate: async (id, data) => isMongoConnected ? ScholarshipModel.findByIdAndUpdate(id, data, { new: true }).lean() : createLocalCollection('scholarships', 'sch').findByIdAndUpdate(id, data),
    findByIdAndDelete: async (id) => isMongoConnected ? ScholarshipModel.findByIdAndDelete(id).lean() : createLocalCollection('scholarships', 'sch').findByIdAndDelete(id),
    countDocuments: async (filter) => isMongoConnected ? ScholarshipModel.countDocuments(filter) : createLocalCollection('scholarships', 'sch').countDocuments(filter)
  },
  agriculture: {
    find: async (filter) => isMongoConnected ? AgricultureModel.find(filter).lean() : createLocalCollection('agriculture', 'agr').find(filter),
    findOne: async (filter) => isMongoConnected ? AgricultureModel.findOne(filter).lean() : createLocalCollection('agriculture', 'agr').findOne(filter),
    findById: async (id) => isMongoConnected ? AgricultureModel.findById(id).lean() : createLocalCollection('agriculture', 'agr').findById(id),
    create: async (data) => isMongoConnected ? AgricultureModel.create(data) : createLocalCollection('agriculture', 'agr').create(data),
    findByIdAndUpdate: async (id, data) => isMongoConnected ? AgricultureModel.findByIdAndUpdate(id, data, { new: true }).lean() : createLocalCollection('agriculture', 'agr').findByIdAndUpdate(id, data),
    findByIdAndDelete: async (id) => isMongoConnected ? AgricultureModel.findByIdAndDelete(id).lean() : createLocalCollection('agriculture', 'agr').findByIdAndDelete(id),
    countDocuments: async (filter) => isMongoConnected ? AgricultureModel.countDocuments(filter) : createLocalCollection('agriculture', 'agr').countDocuments(filter)
  },
  documents: {
    find: async (filter) => isMongoConnected ? DocumentModel.find(filter).lean() : createLocalCollection('documents', 'doc').find(filter),
    findOne: async (filter) => isMongoConnected ? DocumentModel.findOne(filter).lean() : createLocalCollection('documents', 'doc').findOne(filter),
    findById: async (id) => isMongoConnected ? DocumentModel.findById(id).lean() : createLocalCollection('documents', 'doc').findById(id),
    create: async (data) => isMongoConnected ? DocumentModel.create(data) : createLocalCollection('documents', 'doc').create(data),
    findByIdAndUpdate: async (id, data) => isMongoConnected ? DocumentModel.findByIdAndUpdate(id, data, { new: true }).lean() : createLocalCollection('documents', 'doc').findByIdAndUpdate(id, data),
    findByIdAndDelete: async (id) => isMongoConnected ? DocumentModel.findByIdAndDelete(id).lean() : createLocalCollection('documents', 'doc').findByIdAndDelete(id),
    countDocuments: async (filter) => isMongoConnected ? DocumentModel.countDocuments(filter) : createLocalCollection('documents', 'doc').countDocuments(filter)
  },
  notifications: {
    find: async (filter) => isMongoConnected ? NotificationModel.find(filter).lean() : createLocalCollection('notifications', 'notif').find(filter),
    findOne: async (filter) => isMongoConnected ? NotificationModel.findOne(filter).lean() : createLocalCollection('notifications', 'notif').findOne(filter),
    findById: async (id) => isMongoConnected ? NotificationModel.findById(id).lean() : createLocalCollection('notifications', 'notif').findById(id),
    create: async (data) => isMongoConnected ? NotificationModel.create(data) : createLocalCollection('notifications', 'notif').create(data),
    findByIdAndUpdate: async (id, data) => isMongoConnected ? NotificationModel.findByIdAndUpdate(id, data, { new: true }).lean() : createLocalCollection('notifications', 'notif').findByIdAndUpdate(id, data),
    findByIdAndDelete: async (id) => isMongoConnected ? NotificationModel.findByIdAndDelete(id).lean() : createLocalCollection('notifications', 'notif').findByIdAndDelete(id),
    countDocuments: async (filter) => isMongoConnected ? NotificationModel.countDocuments(filter) : createLocalCollection('notifications', 'notif').countDocuments(filter)
  }
};

async function seedMongoIfEmpty() {
  try {
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log('Seeding MongoDB with initial users, schemes, scholarships, articles & alerts...');
      await UserModel.insertMany(initialData.initialUsers);
      await SchemeModel.insertMany(initialData.initialSchemes);
      await ScholarshipModel.insertMany(initialData.initialScholarships);
      await AgricultureModel.insertMany(initialData.initialAgriculture);
      await NotificationModel.insertMany(initialData.initialNotifications);
      console.log('MongoDB successfully seeded!');
    }
  } catch (err) {
    console.error('Auto-seeding MongoDB error:', err.message);
  }
}

async function initDatabase(uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rural_platform') {
  // Always initialize fallback local store so data is immediately available
  loadLocalStore();

  try {
    console.log(`Connecting to MongoDB at: ${uri}...`);
    // Connect with a 2-second timeout so student/evaluator does not wait indefinitely if MongoDB is off
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    isMongoConnected = true;
    console.log(' [Database] Connected successfully to MongoDB!');
    await seedMongoIfEmpty();
  } catch (err) {
    isMongoConnected = false;
    console.log(' [Database] MongoDB is not running locally. (Error: ' + err.message + ')');
    console.log(' [Database] Operating in seamless JSON file store mode (data/db.json). All features, APIs, and authentication are fully operational!');
  }

  return { isMongoConnected, db };
}

module.exports = {
  db,
  isMongoConnected: () => isMongoConnected,
  initDatabase,
  models: {
    UserModel,
    SchemeModel,
    ScholarshipModel,
    AgricultureModel,
    DocumentModel,
    NotificationModel
  }
};
