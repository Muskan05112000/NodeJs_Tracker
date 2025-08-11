// migrateAssociateId.js
const mongoose = require('mongoose');
const Employee = require('./models/Employee');

const MONGO_URI = 'mongodb+srv://Admin:Admin@cluster0.ge3ezsi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function migrate() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const employees = await Employee.find();
  let migrated = 0;
  for (const emp of employees) {
    console.log(emp.name, emp.associateId, typeof emp.associateId, emp.associateId && emp.associateId.constructor && emp.associateId.constructor.name);
    if (emp.associateId && typeof emp.associateId === 'object' && (emp.associateId._bsontype === 'Long' || emp.associateId.constructor && emp.associateId.constructor.name === 'Long')) {
      emp.associateId = emp.associateId.toNumber();
      await emp.save();
      console.log(`Migrated associateId for ${emp.name}`);
      migrated++;
    }
  }
  console.log(`Migration complete! Migrated ${migrated} employees.`);
  mongoose.disconnect();
}

migrate();
