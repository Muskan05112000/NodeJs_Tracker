// backfillUserAssociateId.js
const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://Admin:Admin@cluster0.ge3ezsi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function backfill() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const users = await User.find({ associateId: { $exists: false } });
  let updated = 0;
  for (const user of users) {
    // Find the matching employee by username (name)
    const emp = await Employee.findOne({ name: user.username });
    if (emp && emp.associateId) {
      user.associateId = emp.associateId;
      await user.save();
      console.log(`Updated user ${user.username} with associateId ${emp.associateId}`);
      updated++;
    } else {
      console.log(`No matching employee found for user ${user.username}`);
    }
  }
  console.log(`Backfill complete! Updated ${updated} users.`);
  mongoose.disconnect();
}

backfill();
