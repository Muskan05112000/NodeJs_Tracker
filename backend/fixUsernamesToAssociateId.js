// fixUsernamesToAssociateId.js
const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://Admin:Admin@cluster0.ge3ezsi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function fixUsernames() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const users = await User.find();
  let updated = 0;
  for (const user of users) {
    // Find the matching employee by associateId
    let emp = null;
    if (user.associateId) {
      emp = await Employee.findOne({ associateId: user.associateId });
    } else {
      // fallback: try to find by name
      emp = await Employee.findOne({ name: user.username });
    }
    if (emp && emp.associateId) {
      const newUsername = String(emp.associateId);
      if (user.username !== newUsername) {
        user.username = newUsername;
        await user.save();
        console.log(`Updated user to username=${newUsername} for associateId=${emp.associateId}`);
        updated++;
      }
    }
  }
  console.log(`Username update complete! Updated ${updated} users.`);
  mongoose.disconnect();
}

fixUsernames();
