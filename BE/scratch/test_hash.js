const bcrypt = require('bcryptjs');

async function testHash() {
  const password = 'password123';
  const hash = '$2a$10$wEIfL/A0uDqTf2zJ9iE.f.hD1oQc/1DXY5M8Cg/t5k8P1hWl.rX/.';
  const isMatch = await bcrypt.compare(password, hash);
  console.log('Password match:', isMatch);
}

testHash();
