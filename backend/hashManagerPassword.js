// hashManagerPassword.js
const bcrypt = require('bcryptjs');

const fs = require('fs');
async function run() {
  const password = 'Manager@2024';
  const hash = await bcrypt.hash(password, 10);
  fs.writeFileSync('manager_hash.txt', hash);
  console.log('Hash written to manager_hash.txt');
}

run();
