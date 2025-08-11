// fixUsernamesToEmployeeName.js
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
    if (user.associateId) {
      const emp = await Employee.findOne({ associateId: user.associateId });
      if (emp && emp.name && user.username !== emp.name) {
        user.username = emp.name;
        await user.save();
        console.log(`Updated user to username=${emp.name} for associateId=${emp.associateId}`);
        updated++;
      }
    }
  }
  console.log(`Username update complete! Updated ${updated} users.`);
  mongoose.disconnect();
}

fixUsernames();
