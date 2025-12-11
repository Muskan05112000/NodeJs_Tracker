
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Re-use logic from server.js
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://Admin:Admin@cluster0.ge3ezsi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const backupDir = path.join(__dirname, 'backup_' + Date.now());
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// Define minimal schemas to read data (or just use 'strict: false' to get everything)
const schema = new mongoose.Schema({}, { strict: false });
const Employee = mongoose.model('Employee', schema);
const Leave = mongoose.model('Leave', schema);
const Holiday = mongoose.model('Holiday', schema);
const User = mongoose.model('User', schema);

async function backup() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected.');

    const models = [
      { name: 'employees', model: Employee },
      { name: 'leaves', model: Leave },
      { name: 'holidays', model: Holiday },
      { name: 'users', model: User }
    ];

    for (const { name, model } of models) {
      console.log(`Backing up ${name}...`);
      const data = await model.find({});
      fs.writeFileSync(path.join(backupDir, `${name}.json`), JSON.stringify(data, null, 2));
      console.log(`Saved ${data.length} records to ${name}.json`);
    }

    console.log(`Backup completed successfully to ${backupDir}`);
  } catch (err) {
    console.error('Backup failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

backup();
