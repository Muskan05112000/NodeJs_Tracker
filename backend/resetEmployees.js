// resetEmployees.js
const mongoose = require('mongoose');
const Employee = require('./models/Employee');

const MONGO_URI = 'mongodb+srv://Admin:Admin@cluster0.ge3ezsi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Example seed data - update as needed
const seedEmployees = [
  { name: 'Rahim Basha', team: 'QA', location: 'Chennai', associateId: 3241562 },
  { name: 'Divya', team: 'QA', location: 'Chennai', associateId: 4231567 },
  { name: 'Muskan', team: 'QA', location: 'Chennai', associateId: 2273224 },
  { name: 'Vivekanand', team: 'QA', location: 'Chennai', associateId: 3245678 },
  { name: 'Hrithik S', team: 'QA', location: 'Chennai', associateId: 2282234 },
  { name: 'Veena Shagi', team: 'QA', location: 'Hyderabad', associateId: 2871821 },
  { name: 'Abiram', team: 'Compliance', location: 'Chennai', associateId: 3791712 },
  { name: 'Sajidbaba, Dudekula', team: 'QA', location: 'Banglore', associateId: 2781987 },
  { name: 'Karthik S', team: 'QA', location: 'Chennai', associateId: 4190875 },
  { name: 'Sathesh VP', team: 'QA Automation', location: 'Coimbatore', associateId: 2781932 },
  { name: 'Pradeep Desai', team: 'QA Automation', location: 'Pune', associateId: 3188754 },
  { name: 'Saranya M', team: 'NFT', location: 'Banglore', associateId: 2984563 },
  { name: 'Ravikumar Saranya', team: 'NFT', location: 'Coimbatore', associateId: 3912345 },
  { name: 'Mohammed Fazil', team: 'QA Automation', location: 'UK', associateId: 2983271 },
  { name: 'Suman M', team: 'QA Automation', location: 'Coimbatore', associateId: 2719627 },
  { name: 'Vinoth Subramanian', team: 'QA Automation', location: 'Chennai', associateId: 2297192 },
];

async function resetEmployees() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await Employee.collection.drop();
  console.log('Dropped employees collection');
  await Employee.insertMany(seedEmployees);
  console.log('Recreated employees collection with seed data');
  mongoose.disconnect();
}

resetEmployees();
