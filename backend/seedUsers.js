const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://Admin:Admin@cluster0.ge3ezsi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const Employee = require('./models/Employee');

async function seed() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await User.deleteMany();
  // Seed all users (employees, managers, leads) from Employee collection
  const employees = await Employee.find();
  const users = [];
  const usedUsernames = new Set();
  for (const emp of employees) {
    let baseUsername = emp.name;
    let username = baseUsername;
    let count = 1;
    while (usedUsernames.has(username) || await User.findOne({ username })) {
      username = baseUsername + count;
      count++;
    }
    usedUsernames.add(username);
    // Determine role and password
    let role = emp.role || 'Employee';
    if (emp.name === 'Veena Shagi') role = 'Manager';
    if (emp.name === 'Muskan') role = 'Lead';
    const password = role === 'Employee' ? 'Welcome@123' : 'Manager@2024';
    users.push({ username, password: await bcrypt.hash(password, 10), role });
  }
  await User.insertMany(users);
  console.log('Seeded users!');
  mongoose.disconnect();
}
seed();
