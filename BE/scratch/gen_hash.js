const bcrypt = require('bcryptjs');

async function genHash() {
  const hash = await bcrypt.hash('password123', 10);
  console.log('Correct hash for password123:', hash);
}

genHash();
